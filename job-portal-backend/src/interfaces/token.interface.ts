import { Document, Types } from 'mongoose';

/**
 * JWT access token payload claims.
 */
export interface IJwtPayload {
  userId: string;
  firebaseUid: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Refresh token document stored in the RefreshTokens collection.
 */
export interface IRefreshToken extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  token: string;
  expiresAt: Date;
  isRevoked: boolean;
  revokedAt: Date | null;
  replacedByToken: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date;
}

/**
 * Fields required to create a new refresh token.
 */
export interface ICreateRefreshToken {
  userId: Types.ObjectId | string;
  token: string;
  expiresAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
}
