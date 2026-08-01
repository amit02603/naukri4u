import { FilterQuery } from 'mongoose';
import { BaseRepository } from './base.repository';
import { Job } from '../models/Job.model';
import { IJob } from '../interfaces/job.interface';

/**
 * Repository for the Jobs collection.
 * Extends BaseRepository with job-specific query methods.
 */
export class JobRepository extends BaseRepository<IJob> {
  constructor() {
    super(Job);
  }

  /**
   * Lists jobs with pagination and optional status filtering.
   */
  async listJobs(options: {
    skip: number;
    limit: number;
    sort: Record<string, 1 | -1>;
    status?: string;
  }): Promise<{ jobs: IJob[]; total: number }> {
    const filter: Record<string, unknown> = {};
    if (options.status) {
      filter.status = options.status;
    }

    const [jobs, total] = await Promise.all([
      this.find(filter as FilterQuery<IJob>, {
        skip: options.skip,
        limit: options.limit,
        sort: options.sort,
      }),
      this.count(filter as FilterQuery<IJob>),
    ]);

    return { jobs, total };
  }

  /**
   * Counts jobs grouped by status.
   */
  async countByStatus(): Promise<Array<{ _id: string; count: number }>> {
    return Job.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]).exec();
  }

  /**
   * Gets the count of jobs created per month for the last N months.
   */
  async getMonthlyTrend(months: number = 6): Promise<Array<{ month: string; count: number }>> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    return Job.aggregate([
      { $match: { isDeleted: { $ne: true }, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { month: '$_id', count: 1, _id: 0 } },
    ]).exec();
  }
}
