import jwt from 'jsonwebtoken';

/**
 * Unit tests for TokenHelper.
 *
 * Tests JWT generation, verification, and refresh token generation
 * WITHOUT requiring a database or Firebase connection.
 */

// Mock the env config before importing TokenHelper
jest.mock('../../../src/config/env', () => ({
  env: {
    JWT_SECRET: 'test-jwt-secret-that-is-at-least-32-chars-long',
    JWT_EXPIRES_IN: '15m',
    REFRESH_TOKEN_SECRET: 'test-refresh-secret-that-is-at-least-32-chars',
    REFRESH_TOKEN_EXPIRES_IN_DAYS: 7,
  },
}));

import { TokenHelper } from '../../../src/helpers/token.helper';

describe('TokenHelper', () => {
  const mockUser = {
    _id: { toString: () => '64a1b2c3d4e5f6a7b8c9d0e1' },
    firebaseUid: 'firebase-uid-123',
    phoneNumber: '+919876543210',
    role: 'employee' as const,
    status: 'active' as const,
    isProfileCompleted: false,
    lastLogin: new Date(),
    isDeleted: false,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('generateAccessToken', () => {
    it('should generate a valid JWT token', () => {
      const token = TokenHelper.generateAccessToken(mockUser as any);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include correct claims in the token', () => {
      const token = TokenHelper.generateAccessToken(mockUser as any);
      const decoded = jwt.decode(token) as Record<string, unknown>;

      expect(decoded.userId).toBe('64a1b2c3d4e5f6a7b8c9d0e1');
      expect(decoded.firebaseUid).toBe('firebase-uid-123');
      expect(decoded.role).toBe('employee');
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it('should set expiry to 15 minutes', () => {
      const token = TokenHelper.generateAccessToken(mockUser as any);
      const decoded = jwt.decode(token) as { iat: number; exp: number };

      const expectedDiff = 15 * 60; // 15 minutes in seconds
      const actualDiff = decoded.exp - decoded.iat;

      expect(actualDiff).toBe(expectedDiff);
    });

    it('should handle user with no role', () => {
      const noRoleUser = { ...mockUser, role: null };
      const token = TokenHelper.generateAccessToken(noRoleUser as any);
      const decoded = jwt.decode(token) as Record<string, unknown>;

      expect(decoded.role).toBe('');
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify and decode a valid token', () => {
      const token = TokenHelper.generateAccessToken(mockUser as any);
      const decoded = TokenHelper.verifyAccessToken(token);

      expect(decoded.userId).toBe('64a1b2c3d4e5f6a7b8c9d0e1');
      expect(decoded.firebaseUid).toBe('firebase-uid-123');
      expect(decoded.role).toBe('employee');
    });

    it('should throw on an invalid token', () => {
      expect(() => {
        TokenHelper.verifyAccessToken('invalid-token');
      }).toThrow();
    });

    it('should throw on a token signed with a different secret', () => {
      const fakeToken = jwt.sign({ userId: 'fake' }, 'wrong-secret');

      expect(() => {
        TokenHelper.verifyAccessToken(fakeToken);
      }).toThrow();
    });

    it('should throw on an expired token', () => {
      const expiredToken = jwt.sign(
        { userId: '123', firebaseUid: 'abc', role: 'employee' },
        'test-jwt-secret-that-is-at-least-32-chars-long',
        { expiresIn: '0s' },
      );

      expect(() => {
        TokenHelper.verifyAccessToken(expiredToken);
      }).toThrow();
    });
  });

  describe('generateRefreshTokenString', () => {
    it('should generate a UUID v4 string', () => {
      const token = TokenHelper.generateRefreshTokenString();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      expect(token).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should generate unique tokens', () => {
      const tokens = new Set<string>();
      for (let i = 0; i < 100; i++) {
        tokens.add(TokenHelper.generateRefreshTokenString());
      }
      expect(tokens.size).toBe(100);
    });
  });

  describe('getRefreshTokenExpiryDate', () => {
    it('should return a date 7 days in the future', () => {
      const now = new Date();
      const expiryDate = TokenHelper.getRefreshTokenExpiryDate();

      const diffMs = expiryDate.getTime() - now.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      expect(diffDays).toBe(7);
    });

    it('should return a Date object', () => {
      const expiryDate = TokenHelper.getRefreshTokenExpiryDate();
      expect(expiryDate).toBeInstanceOf(Date);
    });
  });
});
