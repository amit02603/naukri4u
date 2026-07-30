import app from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { logger } from './config/logger';

/**
 * Application entry point.
 *
 * Connects to MongoDB, starts the HTTP server, and sets up
 * graceful shutdown handlers for SIGTERM and SIGINT.
 */
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB Atlas
    await connectDatabase();

    // Start HTTP server
    const server = app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`API base URL: http://localhost:${env.PORT}/api/v1`);

      if (env.NODE_ENV !== 'production') {
        logger.info(`Swagger docs: http://localhost:${env.PORT}/api/docs`);
      }
    });

    // Set server timeouts
    server.keepAliveTimeout = 65000; // Slightly higher than ALB's 60s
    server.headersTimeout = 66000;

    // ─── Graceful Shutdown ─────────────────────────────────────
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      // Stop accepting new connections
      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          // Disconnect from MongoDB
          await disconnectDatabase();
          logger.info('Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during graceful shutdown', { error });
          process.exit(1);
        }
      });

      // Force shutdown after 30 seconds if graceful shutdown fails
      setTimeout(() => {
        logger.error('Forced shutdown — graceful shutdown timed out');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // ─── Unhandled Errors ──────────────────────────────────────
    process.on('unhandledRejection', (reason: Error) => {
      logger.error('Unhandled Rejection', { error: reason.message, stack: reason.stack });
      // In production, you might want to crash and let the process manager restart
    });

    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
      // Uncaught exceptions leave the app in an undefined state — must exit
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

startServer();
