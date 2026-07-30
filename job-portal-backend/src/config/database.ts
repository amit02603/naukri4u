import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

/**
 * Establishes connection to MongoDB Atlas with retry logic.
 *
 * Mongoose 8+ handles connection pooling, reconnection, and buffering
 * automatically. We configure minimal options and rely on Atlas defaults.
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    logger.error('MongoDB initial connection failed', { error });
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error', { error: err.message });
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected. Mongoose will attempt to reconnect automatically.');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected successfully');
  });
};

/**
 * Gracefully disconnects from MongoDB.
 * Called during application shutdown.
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected gracefully');
  } catch (error) {
    logger.error('Error during MongoDB disconnect', { error });
  }
};

/**
 * Returns the current MongoDB connection readiness state.
 * 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
 */
export const getDatabaseStatus = (): number => {
  return mongoose.connection.readyState;
};
