import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';
import { sendError } from '../helpers/response.helper';

/**
 * Global error handler middleware.
 *
 * Catches all errors thrown in route handlers and middlewares.
 * Converts them into standardized error responses.
 *
 * Handles:
 * - ApiError instances (operational errors)
 * - Mongoose validation errors
 * - Mongoose duplicate key errors
 * - Mongoose cast errors (invalid ObjectId)
 * - JWT errors (handled in auth middleware, but as fallback)
 * - Unknown errors (500 Internal Server Error)
 *
 * MUST be registered LAST in the middleware chain.
 */
export const globalErrorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Default values
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: Array<{ field: string; message: string }> = [];
  let isOperational = false;

  // ApiError — our custom error class
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
    isOperational = err.isOperational;
  }
  // Mongoose validation error
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    const mongooseErr = err as unknown as {
      errors: Record<string, { path: string; message: string }>;
    };
    errors = Object.values(mongooseErr.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    isOperational = true;
  }
  // Mongoose duplicate key error
  else if ((err as unknown as { code: number }).code === 11000) {
    statusCode = 409;
    const duplicateErr = err as unknown as { keyValue: Record<string, unknown> };
    const field = Object.keys(duplicateErr.keyValue || {})[0] || 'unknown';
    message = `Duplicate value for field: ${field}`;
    errors = [{ field, message: `${field} already exists` }];
    isOperational = true;
  }
  // Mongoose CastError (invalid ObjectId)
  else if (err.name === 'CastError') {
    statusCode = 400;
    const castErr = err as unknown as { path: string; value: string };
    message = `Invalid ${castErr.path}: ${castErr.value}`;
    errors = [{ field: castErr.path, message: `Invalid value: ${castErr.value}` }];
    isOperational = true;
  }
  // JWT errors (fallback)
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    isOperational = true;
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    isOperational = true;
  }

  // Log the error
  if (!isOperational) {
    // Unexpected error — log full details
    logger.error('Unhandled error', {
      error: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      statusCode,
    });
  } else {
    // Operational error — log at warn level
    logger.warn('Operational error', {
      message: err.message,
      url: req.originalUrl,
      method: req.method,
      statusCode,
    });
  }

  sendError(res, statusCode, message, errors);
};

/**
 * 404 Not Found handler.
 * Catches requests to undefined routes.
 * Must be registered AFTER all valid routes.
 */
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};
