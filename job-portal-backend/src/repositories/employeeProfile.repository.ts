import { FilterQuery } from 'mongoose';
import { BaseRepository } from './base.repository';
import { EmployeeProfile } from '../models/EmployeeProfile.model';
import { IEmployeeProfile } from '../interfaces/profile.interface';

/**
 * Repository for the EmployeeProfiles collection.
 */
export class EmployeeProfileRepository extends BaseRepository<IEmployeeProfile> {
  constructor() {
    super(EmployeeProfile);
  }

  /**
   * Finds an employee profile by user ID.
   */
  async findByUserId(userId: string): Promise<IEmployeeProfile | null> {
    return this.findOne({ userId } as FilterQuery<IEmployeeProfile>);
  }

  /**
   * Lists all employee profiles with pagination.
   */
  async listAll(options: {
    skip: number;
    limit: number;
    sort: Record<string, 1 | -1>;
  }): Promise<{ profiles: IEmployeeProfile[]; total: number }> {
    const filter = {} as FilterQuery<IEmployeeProfile>;
    const [profiles, total] = await Promise.all([
      this.find(filter, {
        skip: options.skip,
        limit: options.limit,
        sort: options.sort,
      }),
      this.count(filter),
    ]);
    return { profiles, total };
  }
}
