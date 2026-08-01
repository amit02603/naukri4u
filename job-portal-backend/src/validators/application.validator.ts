import { body } from 'express-validator';
import { ApplicationStatus } from '../interfaces/application.interface';

/**
 * Validation rules for Application endpoints.
 */

/**
 * POST /api/v1/applications
 */
export const createApplicationValidation = [
  body('jobId')
    .trim()
    .notEmpty()
    .withMessage('Job ID is required')
    .isMongoId()
    .withMessage('Job ID must be a valid ObjectId'),
  body('resumeUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Resume URL must be a valid URL'),
];

/**
 * PATCH /api/v1/applications/:id/status
 */
export const updateApplicationStatusValidation = [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(Object.values(ApplicationStatus))
    .withMessage(`Status must be one of: ${Object.values(ApplicationStatus).join(', ')}`),
];
