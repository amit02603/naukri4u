import { body } from 'express-validator';

/**
 * Validation rules for admin manual entry and management endpoints.
 */

/**
 * POST /api/v1/admin/employees
 */
export const createManualEmployeeValidation = [
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isString()
    .withMessage('Phone number must be a string'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Employee name is required')
    .isString()
    .withMessage('Name must be a string'),
  body('skills')
    .optional()
    .trim()
    .isString()
    .withMessage('Skills must be a string'),
  body('experience')
    .optional()
    .trim()
    .isString()
    .withMessage('Experience must be a string'),
];

/**
 * POST /api/v1/admin/recruiters
 */
export const createManualRecruiterValidation = [
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isString()
    .withMessage('Phone number must be a string'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Recruiter name is required')
    .isString()
    .withMessage('Name must be a string'),
  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isString()
    .withMessage('Company name must be a string'),
  body('designation')
    .optional()
    .trim()
    .isString()
    .withMessage('Designation must be a string'),
];

/**
 * PUT /api/v1/admin/employees/:id
 */
export const updateEmployeeValidation = [
  body('name')
    .optional()
    .trim()
    .isString()
    .withMessage('Name must be a string'),
  body('phone')
    .optional()
    .trim()
    .isString()
    .withMessage('Phone must be a string'),
  body('skills')
    .optional()
    .trim()
    .isString()
    .withMessage('Skills must be a string'),
  body('experience')
    .optional()
    .trim()
    .isString()
    .withMessage('Experience must be a string'),
];

/**
 * PUT /api/v1/admin/recruiters/:id
 */
export const updateRecruiterValidation = [
  body('name')
    .optional()
    .trim()
    .isString()
    .withMessage('Name must be a string'),
  body('company')
    .optional()
    .trim()
    .isString()
    .withMessage('Company name must be a string'),
  body('designation')
    .optional()
    .trim()
    .isString()
    .withMessage('Designation must be a string'),
];
