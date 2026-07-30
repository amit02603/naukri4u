import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '../constants/routes';

/**
 * Custom hook wrapping authentication actions and states.
 * 
 * Provides unified access to auth store values, login exchange,
 * and secure logout handling.
 */
export function useAuth() {
  const router = useRouter();
  const store = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Exchanges a verified Firebase ID Token for a backend JWT session.
   * If successful, saves the tokens to Zustand store and redirects.
   */
  const loginWithToken = async (firebaseIdToken: string, deviceToken?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.login(firebaseIdToken, deviceToken);
      if (res.success && res.data) {
        const { user, accessToken, refreshToken } = res.data;
        store.setAuth(user, accessToken, refreshToken);
        
        // Redirect based on profile completion status
        if (user.role && user.isProfileCompleted) {
          router.push(ROUTES.DASHBOARD);
        } else {
          // If role is null or profile is incomplete, the app flow would usually go to role selection
          // For Phase 1, we redirect straight to dashboard home page
          router.push(ROUTES.DASHBOARD);
        }
        return true;
      } else {
        setError(res.message || 'Login failed');
        return false;
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const errMsg = errorObj.response?.data?.message || errorObj.message || 'An error occurred during login';
      setError(errMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles user logout. Calls the backend logout endpoint (revoking the refresh token)
   * and clears the local store session.
   */
  const logout = async () => {
    setIsLoading(true);
    try {
      const { refreshToken } = store;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (err) {
      console.error('Logout API call failed', err);
    } finally {
      store.clearAuth();
      setIsLoading(false);
      router.push(ROUTES.LOGIN);
    }
  };

  return {
    user: store.user,
    accessToken: store.accessToken,
    isAuthenticated: store.isAuthenticated,
    isInitialized: store.isInitialized,
    isLoading,
    error,
    loginWithToken,
    logout,
  };
}
export default useAuth;
