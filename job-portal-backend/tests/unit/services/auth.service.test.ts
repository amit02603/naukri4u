import { Types } from 'mongoose';

/**
 * Unit tests for AuthService.
 *
 * Mocks all dependencies (Firebase, repositories) to test
 * business logic in isolation.
 */

// Mock dependencies before imports
jest.mock('../../../src/config/firebase', () => ({
  firebaseAuth: {
    verifyIdToken: jest.fn(),
  },
}));

jest.mock('../../../src/config/env', () => ({
  env: {
    JWT_SECRET: 'test-jwt-secret-that-is-at-least-32-chars-long',
    JWT_EXPIRES_IN: '15m',
    REFRESH_TOKEN_SECRET: 'test-refresh-secret-that-is-at-least-32-chars',
    REFRESH_TOKEN_EXPIRES_IN_DAYS: 7,
    NODE_ENV: 'test',
  },
}));

jest.mock('../../../src/config/logger', () => ({
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
}));

import { AuthService } from '../../../src/services/auth.service';
import { firebaseAuth } from '../../../src/config/firebase';
import { UserStatus } from '../../../src/interfaces/user.interface';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('login', () => {
    const mockFirebaseToken = 'valid-firebase-id-token';
    const mockDecodedToken = {
      uid: 'firebase-uid-123',
      phone_number: '+919876543210',
    };

    it('should create a new user when logging in for the first time', async () => {
      // Mock Firebase verification
      (firebaseAuth.verifyIdToken as any).mockResolvedValue(mockDecodedToken);

      const result = await authService.login(mockFirebaseToken, undefined, '127.0.0.1', 'Jest');

      expect(result).toBeDefined();
      expect(result.isNewUser).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.phoneNumber).toBe('+919876543210');
      expect(result.user.firebaseUid).toBe('firebase-uid-123');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should return existing user on subsequent login', async () => {
      (firebaseAuth.verifyIdToken as any).mockResolvedValue(mockDecodedToken);

      // First login — creates user
      const firstResult = await authService.login(mockFirebaseToken);
      expect(firstResult.isNewUser).toBe(true);

      // Second login — finds existing user
      const secondResult = await authService.login(mockFirebaseToken);
      expect(secondResult.isNewUser).toBe(false);
      expect(secondResult.user.id).toBe(firstResult.user.id);
    });

    it('should throw on invalid Firebase token', async () => {
      (firebaseAuth.verifyIdToken as any).mockRejectedValue(
        new Error('Firebase ID token has expired'),
      );

      await expect(
        authService.login('invalid-token'),
      ).rejects.toThrow('Invalid or expired Firebase ID token');
    });

    it('should throw when Firebase token has no phone number', async () => {
      (firebaseAuth.verifyIdToken as any).mockResolvedValue({
        uid: 'firebase-uid-123',
        // No phone_number
      });

      await expect(
        authService.login(mockFirebaseToken),
      ).rejects.toThrow('Firebase token does not contain a phone number');
    });

    it('should throw for blocked user', async () => {
      (firebaseAuth.verifyIdToken as any).mockResolvedValue(mockDecodedToken);

      // Create user first
      await authService.login(mockFirebaseToken);

      // Block the user directly in the DB
      const mongoose = await import('mongoose');
      await mongoose.model('User').updateOne(
        { firebaseUid: mockDecodedToken.uid },
        { $set: { status: UserStatus.BLOCKED } },
      );

      // Try to login again
      await expect(
        authService.login(mockFirebaseToken),
      ).rejects.toThrow('Your account has been blocked');
    });
  });

  describe('refresh', () => {
    const mockDecodedToken = {
      uid: 'firebase-uid-refresh',
      phone_number: '+919876543211',
    };

    it('should rotate refresh token and return new tokens', async () => {
      (firebaseAuth.verifyIdToken as any).mockResolvedValue(mockDecodedToken);

      // Login to get tokens
      const loginResult = await authService.login('firebase-token');

      // Refresh
      const refreshResult = await authService.refresh(loginResult.refreshToken);

      expect(refreshResult.accessToken).toBeDefined();
      expect(refreshResult.refreshToken).toBeDefined();
      expect(refreshResult.refreshToken).not.toBe(loginResult.refreshToken);
    });

    it('should throw on invalid refresh token', async () => {
      await expect(
        authService.refresh('non-existent-token'),
      ).rejects.toThrow('Invalid refresh token');
    });

    it('should revoke all tokens on token reuse', async () => {
      (firebaseAuth.verifyIdToken as any).mockResolvedValue(mockDecodedToken);

      const loginResult = await authService.login('firebase-token');
      const oldRefreshToken = loginResult.refreshToken;

      // First refresh — valid, old token gets revoked
      await authService.refresh(oldRefreshToken);

      // Second refresh with OLD token — reuse detected!
      await expect(
        authService.refresh(oldRefreshToken),
      ).rejects.toThrow('Refresh token has been revoked');
    });
  });

  describe('logout', () => {
    const mockDecodedToken = {
      uid: 'firebase-uid-logout',
      phone_number: '+919876543212',
    };

    it('should revoke the refresh token', async () => {
      (firebaseAuth.verifyIdToken as any).mockResolvedValue(mockDecodedToken);

      const loginResult = await authService.login('firebase-token');

      // Logout
      await authService.logout(
        loginResult.user.id,
        loginResult.refreshToken,
      );

      // Try to refresh with the revoked token
      await expect(
        authService.refresh(loginResult.refreshToken),
      ).rejects.toThrow();
    });
  });

  describe('getMe', () => {
    const mockDecodedToken = {
      uid: 'firebase-uid-me',
      phone_number: '+919876543213',
    };

    it('should return the sanitized user profile', async () => {
      (firebaseAuth.verifyIdToken as any).mockResolvedValue(mockDecodedToken);

      const loginResult = await authService.login('firebase-token');

      const user = await authService.getMe(loginResult.user.id);

      expect(user.id).toBe(loginResult.user.id);
      expect(user.phoneNumber).toBe('+919876543213');
      expect(user.firebaseUid).toBe('firebase-uid-me');
    });

    it('should throw for non-existent user ID', async () => {
      const fakeId = new Types.ObjectId().toString();

      await expect(
        authService.getMe(fakeId),
      ).rejects.toThrow('User not found');
    });
  });
});
