import { Router, Request, Response } from 'express';
import { getDatabaseStatus } from '../../config/database';
import { sendSuccess } from '../../helpers/response.helper';
import { HttpStatus } from '../../constants/httpStatus';

const router = Router();

/**
 * Database readyState to human-readable string mapping.
 */
const DB_STATES: Record<number, string> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

/**
 * Formats bytes into a human-readable MB string.
 */
const formatBytes = (bytes: number): string => {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: System health status
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/HealthResponse'
 */
router.get('/', (_req: Request, res: Response) => {
  const dbState = getDatabaseStatus();
  const memUsage = process.memoryUsage();

  const healthData = {
    status: dbState === 1 ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    database: {
      status: DB_STATES[dbState] || 'unknown',
      readyState: dbState,
    },
    memory: {
      rss: formatBytes(memUsage.rss),
      heapUsed: formatBytes(memUsage.heapUsed),
      heapTotal: formatBytes(memUsage.heapTotal),
      external: formatBytes(memUsage.external),
    },
  };

  const statusCode = dbState === 1 ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;

  sendSuccess(res, statusCode, 'Health check', healthData);
});

export default router;
