import { Response, NextFunction } from 'express';
import { IAuthenticatedRequest } from '../interfaces/common.interface';
import { ProfileService } from '../services/profile.service';
import { sendSuccess } from '../helpers/response.helper';
import { HttpStatus } from '../constants/httpStatus';
import { UserRole } from '../interfaces/user.interface';

const profileService = new ProfileService();

/**
 * Controller for Profile & Role Management.
 */
export class ProfileController {
  /**
   * POST /api/v1/users/role
   * Selects user role (employer or employee).
   */
  static async selectRole(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { role } = req.body;
      const result = await profileService.selectRole(userId, role as UserRole);

      sendSuccess(res, HttpStatus.OK, 'Role updated successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/profiles/me
   * Fetches current user profile and role details.
   */
  static async getMyProfile(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const role = req.user!.role;
      const result = await profileService.getProfile(userId, role);

      sendSuccess(res, HttpStatus.OK, 'Profile fetched successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/profiles/employer
   * Updates employer profile.
   */
  static async updateEmployerProfile(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const profile = await profileService.upsertEmployerProfile(userId, req.body);

      sendSuccess(res, HttpStatus.OK, 'Employer profile saved successfully', profile);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/profiles/employee
   * Updates employee profile.
   */
  static async updateEmployeeProfile(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const profile = await profileService.upsertEmployeeProfile(userId, req.body);

      sendSuccess(res, HttpStatus.OK, 'Employee profile saved successfully', profile);
    } catch (error) {
      next(error);
    }
  }
}
