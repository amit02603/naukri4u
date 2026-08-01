import { JobRepository } from '../repositories/job.repository';
import { ICreateJob, IJob, JobStatus } from '../interfaces/job.interface';
import { UserRole } from '../interfaces/user.interface';
import { ApiError } from '../utils/ApiError';
import { FilterQuery, Types } from 'mongoose';
import { logger } from '../config/logger';

const jobRepo = new JobRepository();

/**
 * Service for Job Postings & Management.
 */
export class JobService {
  /**
   * Creates a new job posting.
   */
  async createJob(postedBy: string, data: Partial<ICreateJob>): Promise<IJob> {
    const jobData: ICreateJob = {
      title: data.title!,
      company: data.company!,
      location: data.location || '',
      description: data.description || '',
      salary: data.salary || '',
      status: data.status || JobStatus.ACTIVE,
      postedBy: new Types.ObjectId(postedBy),
    };

    const job = await jobRepo.create(jobData as Partial<IJob>);
    logger.info('New job posted', { jobId: job._id, title: job.title, postedBy });
    return job;
  }

  /**
   * Finds a job by ID.
   */
  async getJobById(jobId: string): Promise<IJob> {
    const job = await jobRepo.findById(jobId);
    if (!job) {
      throw ApiError.notFound('Job posting not found');
    }
    return job;
  }

  /**
   * Updates an existing job posting (only owner or admin).
   */
  async updateJob(
    jobId: string,
    userId: string,
    role: string,
    updateData: Partial<IJob>,
  ): Promise<IJob> {
    const job = await this.getJobById(jobId);

    // Permission check: owner or admin
    if (job.postedBy.toString() !== userId && role !== UserRole.ADMIN) {
      throw ApiError.forbidden('You do not have permission to edit this job posting');
    }

    const updatedJob = await jobRepo.updateById(jobId, { $set: updateData });
    logger.info('Job updated', { jobId, userId });
    return updatedJob!;
  }

  /**
   * Soft-deletes a job posting (only owner or admin).
   */
  async deleteJob(jobId: string, userId: string, role: string): Promise<void> {
    const job = await this.getJobById(jobId);

    if (job.postedBy.toString() !== userId && role !== UserRole.ADMIN) {
      throw ApiError.forbidden('You do not have permission to delete this job posting');
    }

    await jobRepo.softDelete(jobId);
    logger.info('Job soft-deleted', { jobId, userId });
  }

  /**
   * Lists jobs with filters (search, status, location) and pagination.
   */
  async listJobs(options: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    company?: string;
  }) {
    const skip = (options.page - 1) * options.limit;
    const filter: Record<string, unknown> = {};

    if (options.status) {
      filter.status = options.status;
    }
    if (options.company) {
      filter.company = { $regex: options.company, $options: 'i' };
    }
    if (options.search) {
      filter.$or = [
        { title: { $regex: options.search, $options: 'i' } },
        { company: { $regex: options.search, $options: 'i' } },
        { location: { $regex: options.search, $options: 'i' } },
      ];
    }

    const [jobs, total] = await Promise.all([
      jobRepo.find(filter as FilterQuery<IJob>, {
        skip,
        limit: options.limit,
        sort: { createdAt: -1 },
      }),
      jobRepo.count(filter as FilterQuery<IJob>),
    ]);

    return {
      jobs,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    };
  }
}
