'use client';

import {useAuthStore} from '@/src/store/useAuthStore';
import {MOCK_USER} from '../constants/mockUser';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const reset = useAuthStore((state) => state.reset);

  return {
    user,
    isLoggedIn: user !== null,
    login: () => setUser(MOCK_USER),
    logout: () => reset(),
  };
}
