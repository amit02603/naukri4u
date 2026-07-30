import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '../store/authStore';
import { RefreshResponseData } from '../types/auth';
import { ApiResponse } from '../types/api';

/**
 * Axios Instance Config.
 * 
 * Configures base URL, request headers, request interceptors (attaching JWT),
 * and response interceptors (refresh token rotation on 401).
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Variables to manage refresh token queue
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

// ─── Request Interceptor ─────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState();

    // Attach Bearer token if it exists
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ─── Response Interceptor ────────────────────────────────────
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Skip if not a 401 or if request has already been retried
    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Handle token refresh rotation
    if (isRefreshing) {
      // If refresh is already in progress, queue this request
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject: (err) => {
            reject(err);
          },
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const { refreshToken, clearAuth, updateAccessToken } = useAuthStore.getState();

    if (!refreshToken) {
      clearAuth();
      return Promise.reject(error);
    }

    try {
      // Direct post to refresh endpoint (bypasses interceptor rules)
      const res = await axios.post<ApiResponse<RefreshResponseData>>(
        `${api.defaults.baseURL}/auth/refresh`,
        { refreshToken },
      );

      if (res.data.success && res.data.data) {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data.data;

        // Save new tokens
        updateAccessToken(newAccessToken);
        useAuthStore.setState({ refreshToken: newRefreshToken });

        // Process any queued requests waiting for this token
        processQueue(null, newAccessToken);

        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } else {
        throw new Error('Refresh failed');
      }
    } catch (refreshError) {
      // Refresh token is revoked or expired — force logout
      processQueue(refreshError, null);
      clearAuth();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
