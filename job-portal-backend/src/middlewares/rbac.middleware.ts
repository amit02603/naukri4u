import { Response, NextFunction } from 'express';
import { IAuthenticatedRequest } from '../interfaces/common.interface';
import { ApiError } from '../utils/ApiError';
import { RoleName } from '../constants/roles';
import { PermissionName } from '../constants/permissions';

/**
 * Role-Based Access Control (RBAC) middleware factories.
 *
 * Two approaches:
 * 1. requireRole('admin', 'employer') — checks if user has one of the specified roles
 * 2. requirePermission('job:create') — checks if user has a specific permission
 *
 * Both require the `authenticate` middleware to run first (req.user must exist).
 */

/**
 * Creates middleware that allows only users with specific roles.
 *
 * @example
 * router.get('/admin/users', authenticate, requireRole('admin'), controller);
 * router.post('/jobs', authenticate, requireRole('admin', 'employer'), controller);
 */
export const requireRole = (...roles: RoleName[]) => {
  return (req: IAuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized('Authentication required'));
      return;
    }

    const rawRole = req.user.role as unknown;
    const userRole = Array.isArray(rawRole)
      ? rawRole[0] || ''
      : typeof rawRole === 'string'
      ? rawRole
      : '';

    if (!userRole) {
      next(ApiError.forbidden('You must select a role before accessing this resource'));
      return;
    }

    if (!roles.includes(userRole as RoleName)) {
      next(
        ApiError.forbidden(
          `Access denied. Required role: ${roles.join(' or ')}. Your role: ${userRole}`,
        ),
      );
      return;
    }

    next();
  };
};

/**
 * Creates middleware that allows only users with a specific permission.
 *
 * @example
 * router.post('/jobs', authenticate, requirePermission('job:create'), controller);
 * router.delete('/jobs/:id', authenticate, requirePermission('job:delete'), controller);
 */
export const requirePermission = (...permissions: PermissionName[]) => {
  return (req: IAuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized('Authentication required'));
      return;
    }

    if (!req.user.permissions || req.user.permissions.length === 0) {
      next(ApiError.forbidden('No permissions assigned'));
      return;
    }

    const hasPermission = permissions.every((perm) =>
      req.user!.permissions.includes(perm),
    );

    if (!hasPermission) {
      next(
        ApiError.forbidden(
          `Access denied. Required permission: ${permissions.join(', ')}`,
        ),
      );
      return;
    }

    next();
  };
};

/**
 * Creates middleware that allows users with ANY of the specified permissions.
 * (OR logic, unlike requirePermission which uses AND logic)
 *
 * @example
 * router.get('/applications',
 *   authenticate,
 *   requireAnyPermission('application:view', 'application:list'),
 *   controller
 * );
 */
export const requireAnyPermission = (...permissions: PermissionName[]) => {
  return (req: IAuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized('Authentication required'));
      return;
    }

    if (!req.user.permissions || req.user.permissions.length === 0) {
      next(ApiError.forbidden('No permissions assigned'));
      return;
    }

    const hasAny = permissions.some((perm) =>
      req.user!.permissions.includes(perm),
    );

    if (!hasAny) {
      next(
        ApiError.forbidden(
          `Access denied. Required one of: ${permissions.join(', ')}`,
        ),
      );
      return;
    }

    next();
  };
};
