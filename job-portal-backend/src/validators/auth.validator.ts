import { body } from 'express-validator';

/**
 * Validation rules for authentication endpoints.
 *
 * Each export is an array of express-validator chains
 * that can be passed directly to route middleware.
 */

/**
 * POST /api/v1/auth/login
 */
export const loginValidation = [
  body('firebaseIdToken')
    .trim()
    .notEmpty()
    .withMessage('Firebase ID token is required')
    .isString()
    .withMessage('Firebase ID token must be a string'),
  body('deviceToken')
    .optional()
    .trim()
    .isString()
    .withMessage('Device token must be a string'),
];

/**
 * POST /api/v1/auth/refresh
 */
export const refreshTokenValidation = [
  body('refreshToken')
    .trim()
    .notEmpty()
    .withMessage('Refresh token is required')
    .isString()
    .withMessage('Refresh token must be a string')
    .isUUID(4)
    .withMessage('Invalid refresh token format'),
];

/**
 * POST /api/v1/auth/logout
 */
export const logoutValidation = [
  body('refreshToken')
    .trim()
    .notEmpty()
    .withMessage('Refresh token is required')
    .isString()
    .withMessage('Refresh token must be a string')
    .isUUID(4)
    .withMessage('Invalid refresh token format'),
];
