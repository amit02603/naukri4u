import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { IJwtPayload } from '../interfaces/token.interface';
import { IUser } from '../interfaces/user.interface';
import { env } from '../config/env';

/**
 * Token generation and verification utilities.
 *
 * Access tokens are short-lived JWTs (default 15 minutes).
 * Refresh tokens are opaque UUIDs stored in MongoDB.
 */
export class TokenHelper {
  /**
   * Generates a short-lived JWT access token containing the user's
   * ID, Firebase UID, and role.
   */
  static generateAccessToken(user: IUser): string {
    const payload: Omit<IJwtPayload, 'iat' | 'exp'> = {
      userId: user._id.toString(),
      firebaseUid: user.firebaseUid,
      role: user.role || '',
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  /**
   * Verifies and decodes a JWT access token.
   * Throws if the token is expired, malformed, or has an invalid signature.
   */
  static verifyAccessToken(token: string): IJwtPayload {
    return jwt.verify(token, env.JWT_SECRET) as IJwtPayload;
  }

  /**
   * Generates a cryptographically random refresh token string (UUID v4).
   * This is NOT a JWT — it's an opaque identifier stored in the database.
   */
  static generateRefreshTokenString(): string {
    return uuidv4();
  }

  /**
   * Calculates the expiration date for a new refresh token.
   */
  static getRefreshTokenExpiryDate(): Date {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_EXPIRES_IN_DAYS);
    return expiresAt;
  }
}
