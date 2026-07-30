import { FilterQuery, Types } from 'mongoose';
import { BaseRepository } from './base.repository';
import { User } from '../models/User.model';
import { IUser, ICreateUser, IUpdateUser } from '../interfaces/user.interface';

/**
 * Repository for the Users collection.
 *
 * Extends BaseRepository with user-specific query methods.
 * All database operations for users go through this class.
 */
export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  /**
   * Finds a user by their Firebase UID.
   */
  async findByFirebaseUid(firebaseUid: string): Promise<IUser | null> {
    return this.findOne({ firebaseUid } as FilterQuery<IUser>);
  }

  /**
   * Finds a user by their phone number.
   */
  async findByPhoneNumber(phoneNumber: string): Promise<IUser | null> {
    return this.findOne({ phoneNumber } as FilterQuery<IUser>);
  }

  /**
   * Creates a new user from the registration data.
   */
  async createUser(data: ICreateUser): Promise<IUser> {
    return this.create(data as Partial<IUser>);
  }

  /**
   * Updates user fields by ID.
   */
  async updateUser(userId: string | Types.ObjectId, data: IUpdateUser): Promise<IUser | null> {
    return this.updateById(userId, { $set: data });
  }

  /**
   * Updates the lastLogin timestamp to now.
   */
  async updateLastLogin(userId: string | Types.ObjectId): Promise<IUser | null> {
    return this.updateById(userId, { $set: { lastLogin: new Date() } });
  }

  /**
   * Lists users with pagination, optional role/status filtering, and search.
   */
  async listUsers(options: {
    skip: number;
    limit: number;
    sort: Record<string, 1 | -1>;
    role?: string;
    status?: string;
    search?: string;
  }): Promise<{ users: IUser[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (options.role) {
      filter.role = options.role;
    }
    if (options.status) {
      filter.status = options.status;
    }
    if (options.search) {
      filter.phoneNumber = { $regex: options.search, $options: 'i' };
    }

    const [users, total] = await Promise.all([
      this.find(filter as FilterQuery<IUser>, {
        skip: options.skip,
        limit: options.limit,
        sort: options.sort,
      }),
      this.count(filter as FilterQuery<IUser>),
    ]);

    return { users, total };
  }

  /**
   * Counts users grouped by role.
   */
  async countByRole(): Promise<Array<{ _id: string; count: number }>> {
    return User.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]).exec();
  }

  /**
   * Counts users grouped by status.
   */
  async countByStatus(): Promise<Array<{ _id: string; count: number }>> {
    return User.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]).exec();
  }
}
