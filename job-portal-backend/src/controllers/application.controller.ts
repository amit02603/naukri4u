import { Response, NextFunction } from 'express';
import { IAuthenticatedRequest } from '../interfaces/common.interface';
import { ApplicationService } from '../services/application.service';
import { sendSuccess } from '../helpers/response.helper';
import { HttpStatus } from '../constants/httpStatus';
import { ApplicationStatus } from '../interfaces/application.interface';

const applicationService = new ApplicationService();

/**
 * Controller for Job Applications.
 */
export class ApplicationController {
  /**
   * POST /api/v1/applications
   * Submits a new job application.
   */
  static async applyToJob(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const applicantId = req.user!.userId;
      const { jobId, resumeUrl } = req.body;
      const application = await applicationService.applyToJob(applicantId, jobId, resumeUrl);
      sendSuccess(res, HttpStatus.CREATED, 'Application submitted successfully', application);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/applications/my
   * Lists applications submitted by the logged-in candidate.
   */
  static async getMyApplications(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const applicantId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await applicationService.getMyApplications(applicantId, page, limit);
      sendSuccess(res, HttpStatus.OK, 'Applications fetched successfully', result.applications, {
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
   * GET /api/v1/jobs/:jobId/applications
   * Lists candidates who applied for a specific job.
   */
  static async getJobApplications(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const role = req.user!.role;
      const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await applicationService.getJobApplications(jobId, userId, role, page, limit);
      sendSuccess(res, HttpStatus.OK, 'Job applications fetched successfully', result.applications, {
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
   * PATCH /api/v1/applications/:id/status
   * Updates application status.
   */
  static async updateApplicationStatus(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const role = req.user!.role;
      const applicationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { status } = req.body;

      const updated = await applicationService.updateApplicationStatus(
        applicationId,
        userId,
        role,
        status as ApplicationStatus,
      );
      sendSuccess(res, HttpStatus.OK, 'Application status updated successfully', updated);
    } catch (error) {
      next(error);
    }
  }
}
