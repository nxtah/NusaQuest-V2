import {create} from 'zustand';
import type {AppUser} from '@/src/types/auth';

interface AuthStoreState {
  user: AppUser | null;
  isInitialized: boolean;
  isLoading: boolean;
  setUser: (user: AppUser | null) => void;
  setInitialized: (isInitialized: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  isInitialized: false,
  isLoading: false,
  setUser: (user) => set({user}),
  setInitialized: (isInitialized) => set({isInitialized}),
  setLoading: (isLoading) => set({isLoading}),
  reset: () =>
    set({
      user: null,
      isInitialized: false,
      isLoading: false,
    }),
}));
