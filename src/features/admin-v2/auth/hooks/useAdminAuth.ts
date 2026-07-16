'use client';

import { useAdminAuthStore } from '../store/useAdminAuthStore';
import { ADMIN_USERNAME, ADMIN_PASSWORD } from '../constants/credentials';

export function useAdminAuth() {
  const isLoggedIn = useAdminAuthStore((state) => state.isLoggedIn);
  const setLoggedIn = useAdminAuthStore((state) => state.setLoggedIn);

  const login = (username: string, password: string): boolean => {
    const isValid = username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
    if (isValid) setLoggedIn(true);
    return isValid;
  };

  const logout = () => setLoggedIn(false);

  return { isLoggedIn, login, logout };
}
