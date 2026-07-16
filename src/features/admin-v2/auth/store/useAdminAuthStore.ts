import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminAuthStoreState {
  isLoggedIn: boolean;
  setLoggedIn: (isLoggedIn: boolean) => void;
}

export const useAdminAuthStore = create<AdminAuthStoreState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      setLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
    }),
    {
      name: 'nusaquest-admin-auth-storage',
    },
  ),
);
