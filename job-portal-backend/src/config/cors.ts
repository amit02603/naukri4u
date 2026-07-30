import cors, { CorsOptions } from 'cors';
import { env } from './env';

/**
 * CORS configuration.
 *
 * In production, only whitelisted origins are allowed.
 * Origins are configured via the CORS_ORIGIN env var (comma-separated).
 *
 * Supports credentials (cookies, authorization headers) for cross-origin
 * requests from the admin panel and mobile webviews.
 */
const getAllowedOrigins = (): string[] => {
  return env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
};

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();

    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours preflight cache
};

export const corsMiddleware = cors(corsOptions);
