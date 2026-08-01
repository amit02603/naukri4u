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

  /**
   * PATCH /admin/users/:id/status
   * Updates user account status (active/blocked/deleted).
   */
  static async updateUserStatus(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const targetId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const user = await adminService.updateUserStatus(targetId, status);
      res.status(200).json({
        success: true,
        message: 'User status updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /admin/users/:id/role
   * Updates user role.
   */
  static async updateUserRole(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { role } = req.body;
      const targetId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const user = await adminService.updateUserRole(targetId, role);
      res.status(200).json({
        success: true,
        message: 'User role updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /admin/jobs/:id/status
   * Updates job status (active/pending/closed).
   */
  static async updateJobStatus(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const targetId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const job = await adminService.updateJobStatus(targetId, status);
      res.status(200).json({
        success: true,
        message: 'Job status updated successfully',
        data: job,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /admin/employees
   * Admin manually registers an Employee.
   */
  static async createEmployee(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await adminService.createManualEmployee(req.body);
      res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /admin/recruiters
   * Admin manually registers a Recruiter.
   */
  static async createRecruiter(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await adminService.createManualRecruiter(req.body);
      res.status(201).json({
        success: true,
        message: 'Recruiter created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /admin/employees/:id
   * Admin updates Employee profile.
   */
  static async updateEmployee(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const targetId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const updated = await adminService.updateEmployeeProfile(targetId, req.body);
      res.status(200).json({
        success: true,
        message: 'Employee profile updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /admin/recruiters/:id
   * Admin updates Recruiter profile.
   */
  static async updateRecruiter(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const targetId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const updated = await adminService.updateRecruiterProfile(targetId, req.body);
      res.status(200).json({
        success: true,
        message: 'Recruiter profile updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /admin/users/:id
   * Admin soft-deletes a user account.
   */
  static async deleteUser(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const targetId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await adminService.deleteUser(targetId);
      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /admin/analytics
   * Returns comprehensive analytics data.
   */
  static async getAnalytics(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const analytics = await adminService.getComprehensiveAnalytics();
      res.status(200).json({
        success: true,
        message: 'Comprehensive analytics fetched successfully',
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }
}

