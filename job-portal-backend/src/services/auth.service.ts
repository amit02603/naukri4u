import { firebaseAuth } from '../config/firebase';
import { logger } from '../config/logger';
import { UserRepository } from '../repositories/user.repository';
import { RefreshTokenRepository } from '../repositories/refreshToken.repository';
import { AuditLogService } from './auditLog.service';
import { TokenHelper } from '../helpers/token.helper';
import { ApiError } from '../utils/ApiError';
import { UserStatus } from '../interfaces/user.interface';
import { ILoginResponse, IRefreshTokenResponse, ISanitizedUser } from '../interfaces/auth.interface';
import { DeviceToken } from '../models/DeviceToken.model';

/**
 * Authentication service.
 *
 * Handles the complete auth lifecycle:
 * - Login: Firebase ID token verification → user find/create → JWT + refresh token issuance
 * - Refresh: Rotate refresh token, issue new JWT
 * - Logout: Revoke refresh token
 * - Get Me: Return current user profile
 *
 * Business logic lives here. Controllers only receive request and return response.
 */
export class AuthService {
  private userRepository: UserRepository;
  private refreshTokenRepository: RefreshTokenRepository;
  private auditLogService: AuditLogService;

  constructor() {
    this.userRepository = new UserRepository();
    this.refreshTokenRepository = new RefreshTokenRepository();
    this.auditLogService = new AuditLogService();
  }

  /**
   * Authenticates a user using their Firebase ID token.
   *
   * Flow:
   * 1. Verify Firebase ID token via Admin SDK
   * 2. Extract phone number and Firebase UID
   * 3. Find existing user or create new one
   * 4. Check if user is blocked or deleted
   * 5. Generate JWT access token (short-lived)
   * 6. Generate refresh token (long-lived, stored in DB)
   * 7. Optionally store FCM device token
   * 8. Log audit event
   * 9. Return user + tokens
   */
  async login(
    firebaseIdToken: string,
    deviceToken?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ILoginResponse> {
    // Step 1: Verify Firebase ID token
    const decodedToken = await this.verifyFirebaseToken(firebaseIdToken);

    const phoneNumber = decodedToken.phone_number;
    if (!phoneNumber) {
      throw ApiError.badRequest('Firebase token does not contain a phone number');
    }

    // Step 2: Find or create user
    let user = await this.userRepository.findByFirebaseUid(decodedToken.uid);
    let isNewUser = false;

    if (!user) {
      // New user — create account
      user = await this.userRepository.createUser({
        firebaseUid: decodedToken.uid,
        phoneNumber,
      });
      isNewUser = true;
      logger.info('New user created', { userId: user._id, phoneNumber });
    } else {
      // Existing user — check status
      if (user.status === UserStatus.BLOCKED) {
        throw ApiError.forbidden('Your account has been blocked. Please contact support.');
      }
      if (user.status === UserStatus.DELETED) {
        throw ApiError.forbidden('Your account has been deleted.');
      }

      // Update last login
      user = (await this.userRepository.updateLastLogin(user._id))!;
    }

    // Step 3: Generate tokens
    const accessToken = TokenHelper.generateAccessToken(user);
    const refreshTokenDoc = await this.refreshTokenRepository.createToken(
      user._id,
      ipAddress,
      userAgent,
    );

    // Step 4: Store device token for future FCM (if provided)
    if (deviceToken) {
      await this.storeDeviceToken(user._id.toString(), deviceToken);
    }

    // Step 5: Log audit event
    await this.auditLogService.log({
      actor: user._id,
      action: isNewUser ? 'user.register' : 'user.login',
      resource: 'User',
      resourceId: user._id,
      details: { phoneNumber: user.phoneNumber, isNewUser },
      ipAddress,
      userAgent,
    });

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken: refreshTokenDoc.token,
      isNewUser,
    };
  }

  /**
   * Rotates a refresh token.
   *
   * Flow:
   * 1. Find the refresh token in DB
   * 2. Validate it's not expired or revoked
   * 3. Verify the associated user exists and is active
   * 4. Revoke the old refresh token (recording the replacement)
   * 5. Generate a new refresh token
   * 6. Generate a new JWT access token
   * 7. Return new token pair
   */
  async refresh(
    refreshTokenStr: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<IRefreshTokenResponse> {
    // Step 1: Find token
    const existingToken = await this.refreshTokenRepository.findByToken(refreshTokenStr);

    if (!existingToken) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    // Step 2: Check if revoked (potential token reuse attack)
    if (existingToken.isRevoked) {
      // Token was already used — this could be a replay attack.
      // Revoke ALL tokens for this user as a security precaution.
      logger.warn('Refresh token reuse detected', {
        userId: existingToken.userId,
        token: refreshTokenStr.substring(0, 8) + '...',
      });
      await this.refreshTokenRepository.revokeAllForUser(existingToken.userId);
      throw ApiError.unauthorized('Refresh token has been revoked. Please login again.');
    }

    // Step 3: Check if expired
    if (existingToken.expiresAt < new Date()) {
      throw ApiError.unauthorized('Refresh token has expired');
    }

    // Step 4: Verify user
    const user = await this.userRepository.findById(existingToken.userId.toString());
    if (!user) {
      throw ApiError.unauthorized('User not found');
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw ApiError.forbidden('Account is not active');
    }

    // Step 5: Create new refresh token FIRST (so we have its value for rotation tracking)
    const newRefreshToken = await this.refreshTokenRepository.createToken(
      user._id,
      ipAddress,
      userAgent,
    );

    // Step 6: Revoke old token and record what replaced it
    await this.refreshTokenRepository.revokeById(existingToken._id, newRefreshToken.token);

    // Step 7: Generate new access token
    const accessToken = TokenHelper.generateAccessToken(user);

    return {
      accessToken,
      refreshToken: newRefreshToken.token,
    };
  }

  /**
   * Logs out a user by revoking their refresh token.
   */
  async logout(
    userId: string,
    refreshTokenStr: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    // Revoke the specific refresh token
    const token = await this.refreshTokenRepository.findByToken(refreshTokenStr);

    if (token && token.userId.toString() === userId && !token.isRevoked) {
      await this.refreshTokenRepository.revokeByToken(refreshTokenStr);
    }

    // Log audit event
    await this.auditLogService.log({
      actor: userId,
      action: 'user.logout',
      resource: 'User',
      resourceId: userId,
      ipAddress,
      userAgent,
    });

    logger.info('User logged out', { userId });
  }

  /**
   * Returns the current authenticated user's profile.
   */
  async getMe(userId: string): Promise<ISanitizedUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return this.sanitizeUser(user);
  }

  /**
   * Verifies a Firebase ID token using the Admin SDK.
   * Returns the decoded token claims on success.
   * Throws an ApiError on failure.
   */
  private async verifyFirebaseToken(idToken: string) {
    try {
      return await firebaseAuth.verifyIdToken(idToken);
    } catch (error) {
      logger.warn('Firebase token verification failed', { error });
      throw ApiError.unauthorized('Invalid or expired Firebase ID token');
    }
  }

  /**
   * Stores or updates a device token for FCM push notifications.
   * If the token already exists for another user, it reassigns it.
   */
  private async storeDeviceToken(userId: string, token: string): Promise<void> {
    try {
      await DeviceToken.findOneAndUpdate(
        { token },
        {
          $set: {
            userId,
            token,
            platform: 'android', // Will be passed from client in future
            isActive: true,
            lastUsedAt: new Date(),
          },
        },
        { upsert: true, new: true },
      );
    } catch (error) {
      // Non-critical — log but don't fail the login
      logger.warn('Failed to store device token', { userId, error });
    }
  }

  /**
   * Strips internal fields from a user document for API responses.
   */
  private sanitizeUser(user: {
    _id: { toString(): string };
    firebaseUid: string;
    phoneNumber: string;
    role: unknown;
    status: string;
    isProfileCompleted: boolean;
    lastLogin: Date;
    createdAt: Date;
    updatedAt: Date;
  }): ISanitizedUser {
    const rawRole = user.role;
    const roleString = Array.isArray(rawRole)
      ? rawRole[0] || null
      : typeof rawRole === 'string'
      ? rawRole
      : null;

    return {
      id: user._id.toString(),
      firebaseUid: user.firebaseUid,
      phoneNumber: user.phoneNumber,
      role: roleString,
      status: user.status,
      isProfileCompleted: user.isProfileCompleted,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
