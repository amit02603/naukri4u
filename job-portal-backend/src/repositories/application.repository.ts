import { FilterQuery } from 'mongoose';
import { BaseRepository } from './base.repository';
import { Application } from '../models/Application.model';
import { IApplication } from '../interfaces/application.interface';

/**
 * Repository for the Applications collection.
 * Extends BaseRepository with application-specific query methods.
 */
export class ApplicationRepository extends BaseRepository<IApplication> {
  constructor() {
    super(Application);
  }

  /**
   * Lists applications with pagination, populating applicant and job refs.
   */
  async listApplications(options: {
    skip: number;
    limit: number;
    sort: Record<string, 1 | -1>;
    status?: string;
  }): Promise<{ applications: IApplication[]; total: number }> {
    const filter: Record<string, unknown> = {};
    if (options.status) {
      filter.status = options.status;
    }

    const [applications, total] = await Promise.all([
      this.find(filter as FilterQuery<IApplication>, {
        skip: options.skip,
        limit: options.limit,
        sort: options.sort,
        populate: ['applicant', 'job'],
      }),
      this.count(filter as FilterQuery<IApplication>),
    ]);

    return { applications, total };
  }

  /**
   * Counts applications grouped by status.
   */
  async countByStatus(): Promise<Array<{ _id: string; count: number }>> {
    return Application.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]).exec();
  }

  /**
   * Gets the count of applications per month for the last N months.
   */
  async getMonthlyTrend(months: number = 6): Promise<Array<{ month: string; count: number }>> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    return Application.aggregate([
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
