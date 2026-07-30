import { Types } from 'mongoose';
import { RefreshToken } from '../models/RefreshToken.model';
import { IRefreshToken } from '../interfaces/token.interface';
import { TokenHelper } from '../helpers/token.helper';

/**
 * Repository for the RefreshTokens collection.
 *
 * Handles refresh token lifecycle:
 * - Creation with expiry
 * - Lookup by token string
 * - Token revocation (single, by token string, or all for a user)
 * - Rotation tracking
 *
 * Does NOT extend BaseRepository because refresh tokens
 * don't use soft-delete — they use revocation + TTL auto-cleanup.
 */
export class RefreshTokenRepository {
  /**
   * Creates a new refresh token for the given user.
   * Generates a UUID token string and calculates the expiry date.
   */
  async createToken(
    userId: string | Types.ObjectId,
    ipAddress?: string | null,
    userAgent?: string | null,
  ): Promise<IRefreshToken> {
    const token = TokenHelper.generateRefreshTokenString();
    const expiresAt = TokenHelper.getRefreshTokenExpiryDate();

    return RefreshToken.create({
      userId,
      token,
      expiresAt,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    });
  }

  /**
   * Finds a refresh token document by its token string.
   */
  async findByToken(token: string): Promise<IRefreshToken | null> {
    return RefreshToken.findOne({ token }).exec();
  }

  /**
   * Revokes a refresh token by its document ID.
   * Optionally records which token replaced it (for rotation tracking).
   */
  async revokeById(
    tokenId: string | Types.ObjectId,
    replacedByToken?: string,
  ): Promise<IRefreshToken | null> {
    const update: Record<string, unknown> = {
      isRevoked: true,
      revokedAt: new Date(),
    };
    if (replacedByToken) {
      update.replacedByToken = replacedByToken;
    }
    return RefreshToken.findByIdAndUpdate(tokenId, { $set: update }, { new: true }).exec();
  }

  /**
   * Revokes a refresh token by its token string.
   */
  async revokeByToken(token: string): Promise<IRefreshToken | null> {
    return RefreshToken.findOneAndUpdate(
      { token },
      { $set: { isRevoked: true, revokedAt: new Date() } },
      { new: true },
    ).exec();
  }

  /**
   * Revokes ALL active refresh tokens for a user.
   * Used when a token reuse attack is detected, or on "logout from all devices".
   */
  async revokeAllForUser(userId: string | Types.ObjectId): Promise<number> {
    const result = await RefreshToken.updateMany(
      { userId, isRevoked: false },
      { $set: { isRevoked: true, revokedAt: new Date() } },
    ).exec();
    return result.modifiedCount;
  }

  /**
   * Counts active (non-revoked, non-expired) refresh tokens for a user.
   */
  async countActiveTokens(userId: string | Types.ObjectId): Promise<number> {
    return RefreshToken.countDocuments({
      userId,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    }).exec();
  }
}
