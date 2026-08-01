import { body } from 'express-validator';
import { UserRole } from '../interfaces/user.interface';

/**
 * Validation rules for profile endpoints.
 */

/**
 * POST /api/v1/users/role
 */
export const selectRoleValidation = [
  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required')
    .isIn([UserRole.EMPLOYER, UserRole.EMPLOYEE])
    .withMessage(`Role must be one of: ${UserRole.EMPLOYER}, ${UserRole.EMPLOYEE}`),
];

/**
 * PUT /api/v1/profiles/employer
 */
export const updateEmployerProfileValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
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
 * PUT /api/v1/profiles/employee
 */
export const updateEmployeeProfileValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
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
  body('resumeUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Resume URL must be a valid URL'),
];
