import { FilterQuery } from 'mongoose';
import { BaseRepository } from './base.repository';
import { RecruiterProfile } from '../models/RecruiterProfile.model';
import { IRecruiterProfile } from '../interfaces/profile.interface';

/**
 * Repository for the RecruiterProfiles collection.
 */
export class RecruiterProfileRepository extends BaseRepository<IRecruiterProfile> {
  constructor() {
    super(RecruiterProfile);
  }

  /**
   * Finds a recruiter profile by user ID.
   */
  async findByUserId(userId: string): Promise<IRecruiterProfile | null> {
    return this.findOne({ userId } as FilterQuery<IRecruiterProfile>);
  }

  /**
   * Lists all recruiter profiles with pagination.
   */
  async listAll(options: {
    skip: number;
    limit: number;
    sort: Record<string, 1 | -1>;
  }): Promise<{ profiles: IRecruiterProfile[]; total: number }> {
    const filter = {} as FilterQuery<IRecruiterProfile>;
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
