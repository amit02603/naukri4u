import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { sendError } from '../helpers/response.helper';
import { HttpStatus } from '../constants/httpStatus';

/**
 * Global rate limiter.
 *
 * Applies to all routes. Default: 100 requests per 15 minutes per IP.
 * Configurable via RATE_LIMIT_WINDOW_MS and RATE_LIMIT_MAX env vars.
 */
export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: () => env.NODE_ENV === 'test',
  handler: (_req, res) => {
    sendError(
      res,
      HttpStatus.TOO_MANY_REQUESTS,
      'Too many requests, please try again later',
    );
  },
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    // Use X-Forwarded-For in production (behind a reverse proxy)
    return (req.ip || req.socket.remoteAddress || 'unknown') as string;
  },
});

/**
 * Stricter rate limiter for auth endpoints.
 *
 * Limits to 10 requests per 15 minutes per IP to prevent
 * brute-force attacks on login/OTP endpoints.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
  handler: (_req, res) => {
    sendError(
      res,
      HttpStatus.TOO_MANY_REQUESTS,
      'Too many authentication attempts, please try again later',
    );
  },
  keyGenerator: (req) => {
    return (req.ip || req.socket.remoteAddress || 'unknown') as string;
  },
});

/**
 * Rate limiter for token refresh.
 * More lenient than auth, but still prevents abuse.
 * 30 requests per 15 minutes.
 */
export const refreshRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
  handler: (_req, res) => {
    sendError(
      res,
      HttpStatus.TOO_MANY_REQUESTS,
      'Too many refresh attempts, please try again later',
    );
  },
  keyGenerator: (req) => {
    return (req.ip || req.socket.remoteAddress || 'unknown') as string;
  },
});
