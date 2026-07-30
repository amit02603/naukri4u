import request from 'supertest';
import jwt from 'jsonwebtoken';

/**
 * Integration tests for the Authentication API.
 *
 * Tests the full request → middleware → controller → service → repository flow.
 * Uses MongoDB Memory Server (from tests/setup.ts) for an isolated database.
 * Mocks Firebase Admin SDK since we can't call Firebase from tests.
 */

// Mock Firebase before importing app
jest.mock('../../src/config/firebase', () => ({
  firebaseAuth: {
    verifyIdToken: jest.fn(),
  },
}));

jest.mock('../../src/config/env', () => ({
  env: {
    NODE_ENV: 'test',
    PORT: 5000,
    MONGODB_URI: 'mocked-by-memory-server',
    JWT_SECRET: 'test-jwt-secret-that-is-at-least-32-chars-long',
    JWT_EXPIRES_IN: '15m',
    REFRESH_TOKEN_SECRET: 'test-refresh-secret-that-is-at-least-32-chars',
    REFRESH_TOKEN_EXPIRES_IN_DAYS: 7,
    FIREBASE_PROJECT_ID: 'test-project',
    FIREBASE_CLIENT_EMAIL: 'test@test.iam.gserviceaccount.com',
    FIREBASE_PRIVATE_KEY: 'test-key',
    CLOUDINARY_CLOUD_NAME: 'test',
    CLOUDINARY_API_KEY: 'test',
    CLOUDINARY_API_SECRET: 'test',
    CORS_ORIGIN: '*',
    RATE_LIMIT_WINDOW_MS: 900000,
    RATE_LIMIT_MAX: 1000, // High limit for tests
  },
}));

jest.mock('../../src/config/cloudinary', () => ({
  cloudinary: {},
}));

jest.mock('../../src/config/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    http: jest.fn(),
  },
  auditLogger: {
    info: jest.fn(),
  },
  morganStream: {
    write: jest.fn(),
  },
}));

import app from '../../src/app';
import { firebaseAuth } from '../../src/config/firebase';

describe('Auth API Integration Tests', () => {
  const mockDecodedToken = {
    uid: 'integration-test-uid',
    phone_number: '+919988776655',
  };

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with a valid Firebase token', async () => {
      (firebaseAuth.verifyIdToken as any).mockResolvedValue(mockDecodedToken);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ firebaseIdToken: 'valid-firebase-token' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Login successful');
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.phoneNumber).toBe('+919988776655');
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.isNewUser).toBe(true);
    });

    it('should return isNewUser=false on subsequent login', async () => {
      (firebaseAuth.verifyIdToken as any).mockResolvedValue(mockDecodedToken);

      // First login
      await request(app)
        .post('/api/v1/auth/login')
        .send({ firebaseIdToken: 'valid-firebase-token' });

      // Second login
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ firebaseIdToken: 'valid-firebase-token' })
        .expect(200);

      expect(res.body.data.isNewUser).toBe(false);
    });

    it('should return 422 when firebaseIdToken is missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({})
        .expect(422);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body.errors).toHaveLength(1);
      expect(res.body.errors[0].field).toBe('firebaseIdToken');
    });

    it('should return 401 for invalid Firebase token', async () => {
      (firebaseAuth.verifyIdToken as jest.Mock).mockRejectedValue(
        new Error('Invalid token'),
      );

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ firebaseIdToken: 'invalid-token' })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should accept optional deviceToken', async () => {
      (firebaseAuth.verifyIdToken as any).mockResolvedValue(mockDecodedToken);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          firebaseIdToken: 'valid-firebase-token',
          deviceToken: 'fcm-device-token-abc',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      (firebaseAuth.verifyIdToken as jest.Mock).mockResolvedValue({
        uid: 'refresh-test-uid-' + Date.now(),
        phone_number: '+91' + Math.floor(1000000000 + Math.random() * 9000000000),
      });

      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ firebaseIdToken: 'valid-firebase-token' });

      refreshToken = loginRes.body.data.refreshToken;
    });

    it('should return new tokens with a valid refresh token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.refreshToken).not.toBe(refreshToken);
    });

    it('should return 422 when refreshToken is missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({})
        .expect(422);

      expect(res.body.success).toBe(false);
    });

    it('should return 401 for non-existent refresh token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d' })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should reject a reused refresh token', async () => {
      // First refresh — valid
      await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      // Second refresh with the same token — reuse attack!
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    let accessToken: string;
    let refreshToken: string;

    beforeEach(async () => {
      (firebaseAuth.verifyIdToken as any).mockResolvedValue({
        uid: 'logout-test-uid-' + Date.now(),
        phone_number: '+91' + Math.floor(1000000000 + Math.random() * 9000000000),
      });

      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ firebaseIdToken: 'valid-firebase-token' });

      accessToken = loginRes.body.data.accessToken;
      refreshToken = loginRes.body.data.refreshToken;
    });

    it('should logout successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Logout successful');
    });

    it('should return 401 without auth token', async () => {
      await request(app)
        .post('/api/v1/auth/logout')
        .send({ refreshToken })
        .expect(401);
    });

    it('should invalidate the refresh token after logout', async () => {
      // Logout
      await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken });

      // Try to refresh with the revoked token
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    let accessToken: string;

    beforeEach(async () => {
      (firebaseAuth.verifyIdToken as any).mockResolvedValue({
        uid: 'me-test-uid-' + Date.now(),
        phone_number: '+919988776699',
      });

      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ firebaseIdToken: 'valid-firebase-token' });

      accessToken = loginRes.body.data.accessToken;
    });

    it('should return the current user profile', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.phoneNumber).toBe('+919988776699');
      expect(res.body.data.status).toBe('active');
    });

    it('should return 401 without auth token', async () => {
      await request(app)
        .get('/api/v1/auth/me')
        .expect(401);
    });

    it('should return 401 with invalid JWT', async () => {
      await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-jwt-token')
        .expect(401);
    });

    it('should return 401 with expired JWT', async () => {
      const expiredToken = jwt.sign(
        { userId: '123', firebaseUid: 'abc', role: '' },
        'test-jwt-secret-that-is-at-least-32-chars-long',
        { expiresIn: '0s' },
      );

      await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });

  describe('GET /api/v1/health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/api/v1/health').expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('healthy');
      expect(res.body.data.database.status).toBe('connected');
      expect(res.body.data.memory).toBeDefined();
      expect(res.body.data.uptime).toBeDefined();
    });
  });

  describe('404 Not Found', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/api/v1/nonexistent').expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Route not found');
    });
  });
});
