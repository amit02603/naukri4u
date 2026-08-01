import { body, query } from 'express-validator';
import { JobStatus } from '../interfaces/job.interface';

/**
 * Validation rules for Job endpoints.
 */

/**
 * POST /api/v1/jobs
 */
export const createJobValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Job title is required')
    .isString()
    .withMessage('Job title must be a string'),
  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isString()
    .withMessage('Company name must be a string'),
  body('location')
    .optional()
    .trim()
    .isString()
    .withMessage('Location must be a string'),
  body('description')
    .optional()
    .trim()
    .isString()
    .withMessage('Description must be a string'),
  body('salary')
    .optional()
    .trim()
    .isString()
    .withMessage('Salary must be a string'),
  body('status')
    .optional()
    .trim()
    .isIn(Object.values(JobStatus))
    .withMessage(`Status must be one of: ${Object.values(JobStatus).join(', ')}`),
];

/**
 * PUT /api/v1/jobs/:id
 */
export const updateJobValidation = [
  body('title')
    .optional()
    .trim()
    .isString()
    .withMessage('Job title must be a string'),
  body('company')
    .optional()
    .trim()
    .isString()
    .withMessage('Company name must be a string'),
  body('location')
    .optional()
    .trim()
    .isString()
    .withMessage('Location must be a string'),
  body('description')
    .optional()
    .trim()
    .isString()
    .withMessage('Description must be a string'),
  body('salary')
    .optional()
    .trim()
    .isString()
    .withMessage('Salary must be a string'),
  body('status')
    .optional()
    .trim()
    .isIn(Object.values(JobStatus))
    .withMessage(`Status must be one of: ${Object.values(JobStatus).join(', ')}`),
];

/**
 * GET /api/v1/jobs
 */
export const queryJobsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .trim()
    .isIn(Object.values(JobStatus))
    .withMessage(`Status must be one of: ${Object.values(JobStatus).join(', ')}`),
  query('search')
    .optional()
    .trim()
    .isString()
    .withMessage('Search query must be a string'),
];
