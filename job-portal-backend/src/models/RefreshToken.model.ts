import mongoose, { Schema } from 'mongoose';
import { IRefreshToken } from '../interfaces/token.interface';

/**
 * RefreshTokens collection schema.
 *
 * Stores opaque refresh tokens (UUID v4) linked to users.
 * Supports:
 * - Token rotation: old tokens are revoked, new ones issued
 * - Reuse detection: `replacedByToken` tracks the rotation chain
 * - Auto-cleanup: TTL index on `expiresAt` removes expired tokens
 * - IP/UserAgent tracking: for security auditing
 */
const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    token: {
      type: String,
      required: [true, 'Token is required'],
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiry date is required'],
      index: { expireAfterSeconds: 0 }, // TTL index — MongoDB auto-deletes expired docs
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    replacedByToken: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

// Compound index for finding active tokens for a user
refreshTokenSchema.index({ userId: 1, isRevoked: 1 });

export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema);
