import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { sendError } from '../helpers/response.helper';
import { HttpStatus } from '../constants/httpStatus';

/**
 * Validation middleware.
 *
 * Runs an array of express-validator chains and returns
 * a standardized error response if any validation fails.
 *
 * @example
 * router.post('/login', validate(loginValidation), authController.login);
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    // Check results
    const result = validationResult(req);

    if (result.isEmpty()) {
      return next();
    }

    // Map errors to our standard format
    const errors = result.array().map((error) => ({
      field: 'path' in error ? error.path : 'unknown',
      message: error.msg as string,
    }));

    sendError(res, HttpStatus.UNPROCESSABLE_ENTITY, 'Validation failed', errors);
  };
};
