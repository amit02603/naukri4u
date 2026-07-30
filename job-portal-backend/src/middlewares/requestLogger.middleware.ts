import morgan from 'morgan';
import { morganStream } from '../config/logger';

/**
 * HTTP request logger middleware.
 *
 * Uses Morgan to log all incoming HTTP requests.
 * In development: uses 'dev' format (colorized, concise).
 * In production: uses 'combined' format (Apache-style, complete).
 *
 * Output is piped to Winston via the morganStream adapter,
 * so request logs end up in the same combined.log file.
 */
export const requestLogger =
  process.env.NODE_ENV === 'production'
    ? morgan('combined', { stream: morganStream })
    : morgan('dev', { stream: morganStream });
