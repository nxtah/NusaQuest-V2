'use client';

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  logout as logoutService,
  refreshSession as refreshSessionService,
  signInWithGoogle as signInWithGoogleService,
  subscribeAuthState,
} from '@/src/features/auth/services/auth.service';
import {
  bindSessionActivityEvents,
  clearSessionTimeout,
  resetSessionTimeout,
  startSessionTimeout,
} from '@/src/lib/utils/session';
import {useAuthStore} from '@/src/store/useAuthStore';
import type {AuthContextValue} from '@/src/types/auth';

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}: {children: ReactNode}) {
  const {user, isInitialized, isLoading, setInitialized, setLoading, setUser} = useAuthStore();
  const [sessionExpired, setSessionExpired] = useState(false);

  const handleSessionExpired = useCallback(async () => {
    setSessionExpired(true);
    await logoutService();
    setUser(null);
  }, [setUser]);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      const nextUser = await signInWithGoogleService();
      setUser(nextUser);
      setSessionExpired(false);
      startSessionTimeout(handleSessionExpired);
    } finally {
      setLoading(false);
    }
  }, [handleSessionExpired, setLoading, setUser]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await logoutService();
      setUser(null);
      clearSessionTimeout();
    } finally {
      setLoading(false);
    }
  }, [setLoading, setUser]);

  const refreshSession = useCallback(async () => {
    if (!user) {
      return;
    }

    await refreshSessionService();
  }, [user]);

  useEffect(() => {
    setLoading(true);

    const unsubscribe = subscribeAuthState((nextUser) => {
      setUser(nextUser);
      setInitialized(true);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      clearSessionTimeout();
    };
  }, [setInitialized, setLoading, setUser]);

  useEffect(() => {
    if (!user) {
      clearSessionTimeout();
      return;
    }

    const handleActivity = () => {
      if (!sessionExpired) {
        resetSessionTimeout(handleSessionExpired);
      }
    };

    startSessionTimeout(handleSessionExpired);
    const unbindEvents = bindSessionActivityEvents(handleActivity);

    return () => {
      unbindEvents();
      clearSessionTimeout();
    };
  }, [handleSessionExpired, sessionExpired, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoggedIn: Boolean(user),
      isInitialized,
      signInWithGoogle,
      logout,
      refreshSession,
    }),
    [isInitialized, logout, refreshSession, signInWithGoogle, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
