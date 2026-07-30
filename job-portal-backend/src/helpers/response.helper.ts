import { Response } from 'express';
import { IPaginationMeta, IApiSuccessResponse, IApiErrorResponse } from '../interfaces/common.interface';

/**
 * Sends a standardized success response.
 *
 * @example
 * sendSuccess(res, 200, 'Users fetched successfully', users);
 * sendSuccess(res, 200, 'Users fetched', users, paginationMeta);
 */
export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T,
  meta?: IPaginationMeta,
): Response => {
  const response: IApiSuccessResponse<T> = {
    success: true,
    message,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Sends a standardized error response.
 *
 * @example
 * sendError(res, 400, 'Validation failed', [{ field: 'email', message: 'Invalid email' }]);
 */
export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errors: Array<{ field: string; message: string }> = [],
): Response => {
  const response: IApiErrorResponse = {
    success: false,
    message,
    errors,
  };

  return res.status(statusCode).json(response);
};
