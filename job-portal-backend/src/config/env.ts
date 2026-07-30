import dotenv from 'dotenv';
import { cleanEnv, str, port, num } from 'envalid';

// Load .env file before validation
dotenv.config();

/**
 * Validated environment variables.
 *
 * Uses `envalid` to validate and type all required env vars at startup.
 * If any required variable is missing or invalid, the process exits
 * immediately with a clear error message.
 *
 * This is the ONLY place environment variables should be accessed.
 * Import `env` from this module instead of using `process.env` directly.
 */
export const env = cleanEnv(process.env, {
  // Application
  NODE_ENV: str({ choices: ['development', 'test', 'production'], default: 'development' }),
  PORT: port({ default: 5000 }),

  // MongoDB
  MONGODB_URI: str({ desc: 'MongoDB Atlas connection string' }),

  // JWT
  JWT_SECRET: str({ desc: 'Secret key for signing JWT access tokens (min 32 chars)' }),
  JWT_EXPIRES_IN: str({ default: '15m', desc: 'JWT access token lifetime (e.g., 15m, 1h)' }),
  REFRESH_TOKEN_SECRET: str({ desc: 'Secret key for refresh token hashing (min 32 chars)' }),
  REFRESH_TOKEN_EXPIRES_IN_DAYS: num({ default: 7, desc: 'Refresh token lifetime in days' }),

  // Firebase Admin SDK
  FIREBASE_PROJECT_ID: str({ desc: 'Firebase project ID' }),
  FIREBASE_CLIENT_EMAIL: str({ desc: 'Firebase service account email' }),
  FIREBASE_PRIVATE_KEY: str({ desc: 'Firebase service account private key (with \\n escapes)' }),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: str({ desc: 'Cloudinary cloud name' }),
  CLOUDINARY_API_KEY: str({ desc: 'Cloudinary API key' }),
  CLOUDINARY_API_SECRET: str({ desc: 'Cloudinary API secret' }),

  // CORS
  CORS_ORIGIN: str({
    default: 'http://localhost:3000',
    desc: 'Comma-separated list of allowed origins',
  }),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: num({ default: 900000, desc: 'Rate limit window in milliseconds (15min)' }),
  RATE_LIMIT_MAX: num({ default: 100, desc: 'Max requests per window per IP' }),
});
