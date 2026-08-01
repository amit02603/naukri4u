import { Response, NextFunction } from 'express';
import { IAuthenticatedRequest } from '../interfaces/common.interface';
import { AdminService } from '../services/admin.service';
import { logger } from '../config/logger';

const adminService = new AdminService();

/**
 * Admin Controller.
 *
 * Handles all admin-only endpoints: dashboard stats, and
 * paginated lists for users, recruiters, employees, jobs, applications.
 */
export class AdminController {
  /**
   * GET /admin/dashboard
   * Returns aggregated dashboard statistics.
   */
  static async getDashboardStats(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await adminService.getDashboardStats();
      res.status(200).json({
        success: true,
        message: 'Dashboard stats fetched successfully',
        data,
      });
    } catch (error) {
      logger.error('Admin dashboard stats error', { error });
      next(error);
    }
  }

  /**
   * GET /admin/users
   * Returns paginated list of all users.
   */
  static async listUsers(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const { users, total } = await adminService.listUsers(page, limit);

      res.status(200).json({
        success: true,
        message: 'Users fetched successfully',
        data: users,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      });
    } catch (error) {
      logger.error('Admin list users error', { error });
      next(error);
    }
  }

  /**
   * GET /admin/recruiters
   * Returns paginated list of recruiter profiles.
   */
  static async listRecruiters(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const { profiles, total } = await adminService.listRecruiters(page, limit);

      res.status(200).json({
        success: true,
        message: 'Recruiters fetched successfully',
        data: profiles,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      });
    } catch (error) {
      logger.error('Admin list recruiters error', { error });
      next(error);
    }
  }

  /**
   * GET /admin/employees
   * Returns paginated list of employee profiles.
   */
  static async listEmployees(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const { profiles, total } = await adminService.listEmployees(page, limit);

      res.status(200).json({
        success: true,
        message: 'Employees fetched successfully',
        data: profiles,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      });
    } catch (error) {
      logger.error('Admin list employees error', { error });
      next(error);
    }
  }

  /**
   * GET /admin/jobs
   * Returns paginated list of jobs.
   */
  static async listJobs(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const { jobs, total } = await adminService.listJobs(page, limit);

      res.status(200).json({
        success: true,
        message: 'Jobs fetched successfully',
        data: jobs,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      });
    } catch (error) {
      logger.error('Admin list jobs error', { error });
      next(error);
    }
  }

  /**
   * GET /admin/applications
   * Returns paginated list of applications with populated refs.
   */
  static async listApplications(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const { applications, total } = await adminService.listApplications(page, limit);

      res.status(200).json({
        success: true,
        message: 'Applications fetched successfully',
        data: applications,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      });
    } catch (error) {
      logger.error('Admin list applications error', { error });
      next(error);
    }
  }
}
