import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { corsMiddleware } from './config/cors';
import { swaggerSpec } from './config/swagger';
import { globalRateLimiter } from './middlewares/rateLimiter.middleware';
import { requestLogger } from './middlewares/requestLogger.middleware';
import {
  mongoSanitizeMiddleware,
  hppMiddleware,
  xssSanitizeMiddleware,
} from './middlewares/sanitize.middleware';
import { globalErrorHandler, notFoundHandler } from './middlewares/error.middleware';
import routes from './routes';

/**
 * Express application factory.
 *
 * Configures all middleware in the correct order:
 * 1. Security (helmet, cors, sanitize)
 * 2. Parsing (json, urlencoded)
 * 3. Logging (morgan)
 * 4. Rate limiting
 * 5. Routes
 * 6. Error handling (404 + global)
 *
 * Exported separately from server.ts to support testing
 * (Supertest can import app without starting the HTTP server).
 */
const app = express();

// ─── Security ────────────────────────────────────────────────
app.use(helmet());
app.use(corsMiddleware);
app.use(mongoSanitizeMiddleware);
app.use(hppMiddleware);

// ─── Body Parsing ────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── XSS Sanitization (after body parsing) ──────────────────
app.use(xssSanitizeMiddleware);

// ─── Logging ─────────────────────────────────────────────────
app.use(requestLogger);

// ─── Rate Limiting ───────────────────────────────────────────
app.use(globalRateLimiter);

// ─── Compression ─────────────────────────────────────────────
app.use(compression());

// ─── API Documentation ──────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Job Portal API Documentation',
  }));
}

// ─── API Routes ──────────────────────────────────────────────
app.use('/api', routes);

// ─── Error Handling ──────────────────────────────────────────
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
