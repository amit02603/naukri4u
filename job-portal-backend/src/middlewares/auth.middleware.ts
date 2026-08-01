import { Response, NextFunction } from 'express';
import { IAuthenticatedRequest } from '../interfaces/common.interface';
import { TokenHelper } from '../helpers/token.helper';
import { ApiError } from '../utils/ApiError';
import { getPermissionsForRole } from '../constants/permissions';
import { logger } from '../config/logger';
import { UserRepository } from '../repositories/user.repository';

const userRepo = new UserRepository();

/**
 * JWT Authentication middleware.
 *
 * Extracts the Bearer token from the Authorization header,
 * verifies it, and attaches the decoded user payload to `req.user`.
 *
 * If the token is missing, expired, or invalid, returns 401.
 */
export const authenticate = async (
  req: IAuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token is required');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw ApiError.unauthorized('Access token is required');
    }

    const decoded = TokenHelper.verifyAccessToken(token);
    const rawRole = decoded.role as unknown;
    let roleString = Array.isArray(rawRole)
      ? rawRole[0] || ''
      : typeof rawRole === 'string'
      ? rawRole
      : '';

    // Always fetch fresh user from DB to ensure instant role updates
    if (decoded.userId) {
      const dbUser = await userRepo.findById(decoded.userId);
      if (dbUser && dbUser.role) {
        const dbRawRole = dbUser.role as unknown;
        roleString = Array.isArray(dbRawRole)
          ? dbRawRole[0] || ''
          : typeof dbRawRole === 'string'
          ? dbRawRole
          : '';
      }
    }

    // Attach user payload with resolved permissions to the request
    req.user = {
      userId: decoded.userId,
      firebaseUid: decoded.firebaseUid,
      role: roleString,
      permissions: getPermissionsForRole(roleString),
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }

    // JWT verification errors (expired, malformed, invalid signature)
    const jwtError = error as Error;
    if (jwtError.name === 'TokenExpiredError') {
      next(ApiError.unauthorized('Access token has expired'));
      return;
    }
    if (jwtError.name === 'JsonWebTokenError') {
      next(ApiError.unauthorized('Invalid access token'));
      return;
    }

    logger.error('Unexpected auth error', { error: jwtError.message });
    next(ApiError.unauthorized('Authentication failed'));
  }
};

/**
 * Optional authentication middleware.
 *
 * Same as `authenticate`, but does NOT throw if no token is provided.
 * Useful for endpoints that work for both authenticated and anonymous users
 * (e.g., job listing shows "saved" status if logged in).
 */
export const optionalAuthenticate = (
  req: IAuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next();
  }

  try {
    const decoded = TokenHelper.verifyAccessToken(token);
    const rawRole = decoded.role as unknown;
    const roleString = Array.isArray(rawRole)
      ? rawRole[0] || ''
      : typeof rawRole === 'string'
      ? rawRole
      : '';

    req.user = {
      userId: decoded.userId,
      firebaseUid: decoded.firebaseUid,
      role: roleString,
      permissions: getPermissionsForRole(roleString),
    };
  } catch {
    // Token is invalid but that's OK — treat as anonymous
  }

  next();
};
