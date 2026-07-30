import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AuthState } from '../types/auth';
import { setCookie, deleteCookie } from '../utils/cookies';

interface AuthActions {
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  updateAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
  setInitialized: (val: boolean) => void;
}

/**
 * Zustand store for persisting authentication credentials.
 * 
 * Uses `persist` middleware with localStorage storage.
 * To avoid Next.js hydration mismatch errors, `skipHydration: true` is set.
 * Hydration is triggered manually in the AuthProvider component.
 */
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isInitialized: false,
      setAuth: (user, accessToken, refreshToken) => {
        setCookie('job-portal-auth-token', accessToken, 7);
        return set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },
      updateAccessToken: (accessToken) => {
        setCookie('job-portal-auth-token', accessToken, 7);
        return set({ accessToken });
      },
      clearAuth: () => {
        deleteCookie('job-portal-auth-token');
        return set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
      setInitialized: (isInitialized) => set({ isInitialized }),
    }),
    {
      name: 'job-portal-auth-store',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : dummyStorage)),
      skipHydration: true,
    },
  ),
);

// Dummy storage fallback for Server-Side Rendering (SSR)
const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};
