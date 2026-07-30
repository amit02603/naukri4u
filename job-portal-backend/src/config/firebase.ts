import * as admin from 'firebase-admin';
import { env } from './env';
import { logger } from './logger';

/**
 * Initializes the Firebase Admin SDK using service account credentials
 * from environment variables.
 *
 * The private key is stored in the env var with literal \n sequences,
 * which must be replaced with actual newlines before use.
 */
let firebaseApp: admin.app.App;

try {
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
  logger.info('Firebase Admin SDK initialized successfully');
} catch (error) {
  logger.error('Firebase Admin SDK initialization failed', { error });
  process.exit(1);
}

/**
 * Firebase Authentication instance.
 * Use this to verify ID tokens from the client.
 */
export const firebaseAuth = admin.auth(firebaseApp);

export default firebaseApp;
