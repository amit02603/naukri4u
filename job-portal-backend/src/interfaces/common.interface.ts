import { Request } from 'express';

/**
 * Authenticated user payload attached to requests after JWT verification.
 */
export interface IAuthUser {
  userId: string;
  firebaseUid: string;
  role: string;
  permissions: string[];
}

/**
 * Extends Express Request with the authenticated user payload.
 */
export interface IAuthenticatedRequest extends Request {
  user?: IAuthUser;
}

/**
 * Standard paginated query parameters accepted by list endpoints.
 */
export interface IPaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

/**
 * Pagination metadata included in list API responses.
 */
export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Standard API success response shape.
 */
export interface IApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  meta?: IPaginationMeta;
}

/**
 * Standard API error response shape.
 */
export interface IApiErrorResponse {
  success: false;
  message: string;
  errors: IValidationError[];
}

/**
 * Individual field-level validation error.
 */
export interface IValidationError {
  field: string;
  message: string;
}

/**
 * Soft-deletable document fields.
 */
export interface ISoftDeletable {
  isDeleted: boolean;
  deletedAt: Date | null;
}

/**
 * Timestamp fields added by Mongoose.
 */
export interface ITimestamps {
  createdAt: Date;
  updatedAt: Date;
}
