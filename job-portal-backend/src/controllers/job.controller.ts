import { Response, NextFunction } from 'express';
import { IAuthenticatedRequest } from '../interfaces/common.interface';
import { JobService } from '../services/job.service';
import { sendSuccess } from '../helpers/response.helper';
import { HttpStatus } from '../constants/httpStatus';

const jobService = new JobService();

/**
 * Controller for Job Postings & Search.
 */
export class JobController {
  /**
   * POST /api/v1/jobs
   * Creates a new job posting.
   */
  static async createJob(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const job = await jobService.createJob(userId, req.body);
      sendSuccess(res, HttpStatus.CREATED, 'Job posting created successfully', job);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/jobs
   * Lists jobs with filters and pagination.
   */
  static async listJobs(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const company = req.query.company as string;

      const result = await jobService.listJobs({ page, limit, search, status, company });
      sendSuccess(res, HttpStatus.OK, 'Jobs fetched successfully', result.jobs, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPrevPage: result.page > 1,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/jobs/:id
   * Fetches job details by ID.
   */
  static async getJobById(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const jobId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const job = await jobService.getJobById(jobId);
      sendSuccess(res, HttpStatus.OK, 'Job details fetched successfully', job);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/jobs/:id
   * Updates a job posting.
   */
  static async updateJob(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const role = req.user!.role;
      const jobId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const job = await jobService.updateJob(jobId, userId, role, req.body);
      sendSuccess(res, HttpStatus.OK, 'Job posting updated successfully', job);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/jobs/:id
   * Soft-deletes a job posting.
   */
  static async deleteJob(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const role = req.user!.role;
      const jobId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await jobService.deleteJob(jobId, userId, role);
      sendSuccess(res, HttpStatus.OK, 'Job posting deleted successfully', null);
    } catch (error) {
      next(error);
    }
  }
}
