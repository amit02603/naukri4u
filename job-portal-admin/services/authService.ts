import { api } from '../lib/axios';
import { ApiResponse } from '../types/api';
import { LoginResponseData, User } from '../types/auth';

/**
 * Authentication API Client.
 * 
 * Interacts with the backend authentication endpoints.
 * Note: Firebase client SDK handles actual OTP request and verification;
 * this service exchanges the verified Firebase ID Token for a backend JWT session.
 */
export const authService = {
  /**
   * Exchanges a verified Firebase ID token for a JWT session.
   * Optionally registers a device token for push notifications.
   */
  login: async (firebaseIdToken: string, deviceToken?: string): Promise<ApiResponse<LoginResponseData>> => {
    const res = await api.post<ApiResponse<LoginResponseData>>('/auth/login', {
      firebaseIdToken,
      deviceToken,
    });
    return res.data;
  },

  /**
   * Revokes the current refresh token on the backend to destroy the session.
   */
  logout: async (refreshToken: string): Promise<ApiResponse<Record<string, never>>> => {
    const res = await api.post<ApiResponse<Record<string, never>>>('/auth/logout', {
      refreshToken,
    });
    return res.data;
  },

  /**
   * Retrieves the current user's profile information.
   */
  getMe: async (): Promise<ApiResponse<User>> => {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },
};
export default authService;
