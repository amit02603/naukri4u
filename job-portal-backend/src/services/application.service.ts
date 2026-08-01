import { ApplicationRepository } from '../repositories/application.repository';
import { JobRepository } from '../repositories/job.repository';
import { ApplicationStatus, IApplication } from '../interfaces/application.interface';
import { JobStatus } from '../interfaces/job.interface';
import { UserRole } from '../interfaces/user.interface';
import { ApiError } from '../utils/ApiError';
import { FilterQuery, Types } from 'mongoose';
import { logger } from '../config/logger';

const applicationRepo = new ApplicationRepository();
const jobRepo = new JobRepository();

/**
 * Service for Job Applications Workflow.
 */
export class ApplicationService {
  /**
   * Submits a job application for a candidate.
   */
  async applyToJob(applicantId: string, jobId: string, resumeUrl?: string): Promise<IApplication> {
    // Check job exists
    const job = await jobRepo.findById(jobId);
    if (!job) {
      throw ApiError.notFound('Job posting not found');
    }

    if (job.status !== JobStatus.ACTIVE) {
      throw ApiError.badRequest('This job posting is no longer accepting applications');
    }

    // Check duplicate application
    const existing = await applicationRepo.findOne({
      applicant: new Types.ObjectId(applicantId),
      job: new Types.ObjectId(jobId),
    } as FilterQuery<IApplication>);

    if (existing) {
      throw ApiError.conflict('You have already applied for this job');
    }

    const application = await applicationRepo.create({
      applicant: new Types.ObjectId(applicantId),
      job: new Types.ObjectId(jobId),
      status: ApplicationStatus.APPLIED,
      resumeUrl: resumeUrl || null,
    });

    logger.info('New application submitted', { applicationId: application._id, applicantId, jobId });
    return application;
  }

  /**
   * Lists all applications submitted by a specific employee/candidate.
   */
  async getMyApplications(applicantId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const filter = { applicant: new Types.ObjectId(applicantId) } as FilterQuery<IApplication>;

    const [applications, total] = await Promise.all([
      applicationRepo.find(filter, {
        skip,
        limit,
        sort: { createdAt: -1 },
        populate: ['job'],
      }),
      applicationRepo.count(filter),
    ]);

    return {
      applications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Lists candidates who applied for a specific job (only job owner or admin).
   */
  async getJobApplications(jobId: string, userId: string, role: string, page = 1, limit = 20) {
    const job = await jobRepo.findById(jobId);
    if (!job) {
      throw ApiError.notFound('Job posting not found');
    }

    if (job.postedBy.toString() !== userId && role !== UserRole.ADMIN) {
      throw ApiError.forbidden('You do not have permission to view applicants for this job');
    }

    const skip = (page - 1) * limit;
    const filter = { job: new Types.ObjectId(jobId) } as FilterQuery<IApplication>;

    const [applications, total] = await Promise.all([
      applicationRepo.find(filter, {
        skip,
        limit,
        sort: { createdAt: -1 },
        populate: ['applicant'],
      }),
      applicationRepo.count(filter),
    ]);

    return {
      applications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Updates application status (applied → shortlisted / rejected / hired).
   */
  async updateApplicationStatus(
    applicationId: string,
    userId: string,
    role: string,
    newStatus: ApplicationStatus,
  ): Promise<IApplication> {
    const application = await applicationRepo.findById(applicationId);
    if (!application) {
      throw ApiError.notFound('Application not found');
    }

    const job = await jobRepo.findById(application.job.toString());
    if (job && job.postedBy.toString() !== userId && role !== UserRole.ADMIN) {
      throw ApiError.forbidden('You do not have permission to update this application status');
    }

    const updated = await applicationRepo.updateById(applicationId, {
      $set: { status: newStatus },
    });

    logger.info('Application status updated', { applicationId, newStatus, updatedBy: userId });
    return updated!;
  }
}
