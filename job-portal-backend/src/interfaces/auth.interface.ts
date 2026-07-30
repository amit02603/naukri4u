/**
 * Request body for the login endpoint.
 */
export interface ILoginRequest {
  firebaseIdToken: string;
  deviceToken?: string;
}

/**
 * Response data for the login endpoint.
 */
export interface ILoginResponse {
  user: ISanitizedUser;
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
}

/**
 * Request body for the refresh token endpoint.
 */
export interface IRefreshTokenRequest {
  refreshToken: string;
}

/**
 * Response data for the refresh token endpoint.
 */
export interface IRefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Request body for the logout endpoint.
 */
export interface ILogoutRequest {
  refreshToken: string;
}

/**
 * Sanitized user object returned in API responses.
 * Excludes internal fields like isDeleted, deletedAt.
 */
export interface ISanitizedUser {
  id: string;
  firebaseUid: string;
  phoneNumber: string;
  role: string | null;
  status: string;
  isProfileCompleted: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}
