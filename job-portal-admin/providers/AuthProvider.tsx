'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';

/**
 * Authentication Context Provider.
 * 
 * Core responsibilities:
 * 1. Manually hydrates the Zustand store on mount (preventing SSR hydration mismatches).
 * 2. Performs a token check on mount: if a token exists, calls `/auth/me` to check validity.
 * 3. Handles loading skeleton rendering during the initialization phase.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, clearAuth, setAuth, setInitialized, isInitialized } = useAuthStore();
  const [isClientHydrated, setIsClientHydrated] = useState(false);

  useEffect(() => {
    // 1. Rehydrate the store from localStorage on client side
    const hydrateStore = async () => {
      useAuthStore.persist.rehydrate();
      setIsClientHydrated(true);
    };

    hydrateStore();
  }, []);

  useEffect(() => {
    if (!isClientHydrated) {
      return;
    }

    const checkSession = async () => {
      if (!accessToken) {
        setInitialized(true);
        return;
      }

      try {
        const res = await authService.getMe();
        if (res.success && res.data) {
          const { refreshToken } = useAuthStore.getState();
          setAuth(res.data, accessToken, refreshToken || '');
        } else {
          clearAuth();
        }
      } catch (err) {
        // Axios interceptor will have already logged user out if refresh failed
        console.error('Session check failed', err);
      } finally {
        setInitialized(true);
      }
    };

    checkSession();
  }, [isClientHydrated, accessToken, setAuth, clearAuth, setInitialized]);

  // Render a full-screen loading skeleton during client hydration or session check
  if (!isClientHydrated || !isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-4">
          {/* Custom Spinner */}
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-sm font-medium tracking-wide text-slate-400">Loading your session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default AuthProvider;
