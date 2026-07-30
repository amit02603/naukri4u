import { IPaginationMeta, IPaginationQuery } from '../interfaces/common.interface';

/**
 * Default pagination constants.
 */
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * Parses raw query parameters into validated pagination values.
 * Clamps page to >= 1 and limit to [1, MAX_LIMIT].
 */
export const parsePaginationQuery = (query: IPaginationQuery) => {
  const page = Math.max(DEFAULT_PAGE, Number(query.page) || DEFAULT_PAGE);
  const rawLimit = Number(query.limit) || DEFAULT_LIMIT;
  const limit = Math.min(Math.max(1, rawLimit), MAX_LIMIT);
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  return { page, limit, skip, sort, search: query.search?.trim() || '' };
};

/**
 * Builds pagination metadata for the API response.
 */
export const buildPaginationMeta = (
  page: number,
  limit: number,
  total: number,
): IPaginationMeta => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
