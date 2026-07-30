import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async Express route handler to automatically catch
 * rejected promises and forward them to the global error handler.
 *
 * Eliminates the need for try-catch blocks in every controller method.
 *
 * @example
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await userService.findAll();
 *   res.json(users);
 * }));
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
