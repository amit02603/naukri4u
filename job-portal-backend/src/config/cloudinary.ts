import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';
import { logger } from './logger';

/**
 * Configures the Cloudinary SDK with credentials from environment variables.
 *
 * Cloudinary is used for:
 * - Company logo uploads
 * - Profile image uploads
 * - Resume uploads (PDF)
 */
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

logger.info('Cloudinary configured successfully');

export { cloudinary };
