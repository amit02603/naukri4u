import { HttpStatusCode } from '../constants/httpStatus';

/**
 * Custom application error class.
 *
 * Used throughout the app to throw typed, HTTP-aware errors.
 * The global error handler catches these and returns the appropriate
 * status code and message to the client.
 *
 * @param statusCode - HTTP status code to return
 * @param message - Human-readable error message
 * @param errors - Optional array of field-level validation errors
 * @param isOperational - If true, this is an expected error (e.g., bad input). If false, it's a bug.
 */
export class ApiError extends Error {
  public readonly statusCode: HttpStatusCode | number;
  public readonly isOperational: boolean;
  public readonly errors: Array<{ field: string; message: string }>;

  constructor(
    statusCode: HttpStatusCode | number,
    message: string,
    errors: Array<{ field: string; message: string }> = [],
    isOperational = true,
    stack = '',
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    Object.setPrototypeOf(this, ApiError.prototype);

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Factory: 400 Bad Request
   */
  static badRequest(message: string, errors: Array<{ field: string; message: string }> = []) {
    return new ApiError(400, message, errors);
  }

  /**
   * Factory: 401 Unauthorized
   */
  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  /**
   * Factory: 403 Forbidden
   */
  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  /**
   * Factory: 404 Not Found
   */
  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  /**
   * Factory: 409 Conflict
   */
  static conflict(message: string) {
    return new ApiError(409, message);
  }

  /**
   * Factory: 429 Too Many Requests
   */
  static tooManyRequests(message = 'Too many requests, please try again later') {
    return new ApiError(429, message);
  }

  /**
   * Factory: 500 Internal Server Error
   */
  static internal(message = 'Internal server error') {
    return new ApiError(500, message, [], false);
  }
}
