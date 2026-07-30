import { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { IAuthenticatedRequest } from '../interfaces/common.interface';
import { sendSuccess } from '../helpers/response.helper';
import { HttpStatus } from '../constants/httpStatus';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Authentication controller.
 *
 * Controllers are thin — they extract data from the request,
 * delegate to the service layer, and return the response.
 * No business logic lives here.
 */
const authService = new AuthService();

/**
 * POST /api/v1/auth/login
 *
 * Authenticates a user via their Firebase ID token.
 * Returns JWT access token + refresh token + user profile.
 */
export const login = asyncHandler(async (req: IAuthenticatedRequest, res: Response) => {
  const { firebaseIdToken, deviceToken } = req.body;
  const ipAddress = req.ip || req.socket.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';

  const result = await authService.login(firebaseIdToken, deviceToken, ipAddress, userAgent);

  return sendSuccess(res, HttpStatus.OK, 'Login successful', result);
});

/**
 * POST /api/v1/auth/refresh
 *
 * Exchanges a valid refresh token for a new access token + refresh token pair.
 * The old refresh token is revoked (rotation).
 */
export const refreshToken = asyncHandler(async (req: IAuthenticatedRequest, res: Response) => {
  const { refreshToken: refreshTokenStr } = req.body;
  const ipAddress = req.ip || req.socket.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';

  const result = await authService.refresh(refreshTokenStr, ipAddress, userAgent);

  return sendSuccess(res, HttpStatus.OK, 'Token refreshed successfully', result);
});

/**
 * POST /api/v1/auth/logout
 *
 * Revokes the provided refresh token.
 * Requires authentication (JWT in Authorization header).
 */
export const logout = asyncHandler(async (req: IAuthenticatedRequest, res: Response) => {
  const { refreshToken: refreshTokenStr } = req.body;
  const userId = req.user!.userId;
  const ipAddress = req.ip || req.socket.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';

  await authService.logout(userId, refreshTokenStr, ipAddress, userAgent);

  return sendSuccess(res, HttpStatus.OK, 'Logout successful', {});
});

/**
 * GET /api/v1/auth/me
 *
 * Returns the profile of the currently authenticated user.
 * Requires authentication (JWT in Authorization header).
 */
export const getMe = asyncHandler(async (req: IAuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;

  const user = await authService.getMe(userId);

  return sendSuccess(res, HttpStatus.OK, 'User profile retrieved', user);
});
