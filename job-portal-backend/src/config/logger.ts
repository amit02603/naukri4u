import winston from 'winston';
import path from 'path';

const logDir = path.join(process.cwd(), 'logs');

/**
 * Custom log format: timestamp + level + service + message + metadata.
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

/**
 * Pretty format for console output in development.
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level}: ${message}${metaStr}`;
  }),
);

/**
 * Application logger with separate transports for:
 * - error.log: Only error-level messages
 * - combined.log: All messages (info and above)
 * - Console: Colorized output in development
 *
 * Logs are rotated at 5MB with 5 files retained.
 */
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'job-portal-backend' },
  transports: [
    // Error log — only errors
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    }),
    // Combined log — everything info and above
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
});

// Console transport in non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    }),
  );
}

/**
 * Dedicated audit logger for CUD operations.
 * Writes to a separate audit.log file for compliance and forensics.
 */
export const auditLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'job-portal-audit' },
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'audit.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
    }),
  ],
});

/**
 * Morgan stream adapter — pipes HTTP request logs into Winston.
 */
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};
