import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { Request, Response, NextFunction } from 'express';
import { filterXSS } from 'xss';

/**
 * MongoDB NoSQL injection protection.
 *
 * Strips out any keys from req.body, req.query, and req.params
 * that start with `$` or contain `.`, preventing NoSQL injection
 * attacks like `{ "$gt": "" }` in query parameters.
 */
export const mongoSanitizeMiddleware = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    // Log sanitization events (potential attack attempts)
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`Sanitized key "${key}" in request to ${req.originalUrl}`);
    }
  },
});

/**
 * HTTP Parameter Pollution protection.
 *
 * Prevents attacks that send multiple values for the same parameter
 * (e.g., `?sort=name&sort=malicious`). Only the last value is kept.
 *
 * Whitelisted parameters are allowed to have multiple values
 * (e.g., `?skills=javascript&skills=typescript` for filtering).
 */
export const hppMiddleware = hpp({
  whitelist: [
    'skills',
    'status',
    'role',
    'type',
    'location',
    'sort',
    'fields',
  ],
});

/**
 * XSS (Cross-Site Scripting) sanitization middleware.
 *
 * Sanitizes string values in req.body to prevent stored XSS attacks.
 * Strips out HTML tags and malicious scripts from user input.
 *
 * Applied to POST/PUT/PATCH request bodies only.
 */
export const xssSanitizeMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
};

/**
 * Recursively sanitizes all string values in an object.
 */
function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = filterXSS(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) => {
        if (typeof item === 'string') {
          return filterXSS(item);
        }
        if (typeof item === 'object' && item !== null) {
          return sanitizeObject(item as Record<string, unknown>);
        }
        return item;
      });
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
