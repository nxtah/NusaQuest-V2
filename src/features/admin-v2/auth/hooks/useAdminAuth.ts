'use client';

import { useCallback, useEffect, useState } from 'react';
import { signInWithGoogle, signOutFirebase } from '@/src/lib/firebase/auth';

interface AdminUser {
  uid: string;
  email?: string | null;
  displayName?: string | null;
}

interface SessionResponse {
  ok: boolean;
  authenticated: boolean;
  user?: { uid: string; email?: string | null; role: 'user' | 'admin' };
}

/** Login admin sekarang lewat Firebase Auth beneran (Google sign-in) + custom
    claim `role:'admin'` yang di-cek server-side (`/api/auth/session`,
    `withAuth`) — BUKAN lagi password hardcode client-side. `firestore.rules`
    udah lama nge-gate `questions`/`informationItems` di belakang `isAdmin()`
    (cek `request.auth.token.role=='admin'`), tapi admin-v2 gak pernah login
    Firebase sama sekali sebelum ini — makanya semua write ke 2 koleksi itu
    selalu GAGAL diem-diem (persis laporan "gagal update informasi"). */
export function useAdminAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = (await res.json()) as SessionResponse;
      const isAdmin = Boolean(data.authenticated && data.user?.role === 'admin');
      setIsLoggedIn(isAdmin);
      setUser(isAdmin && data.user ? { uid: data.user.uid, email: data.user.email } : null);
    } catch {
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  const login = useCallback(async (): Promise<boolean> => {
    setError(null);
    try {
      const firebaseUser = await signInWithGoogle();
      if (!firebaseUser) return false; // redirect flow kicked in, no result yet

      const idToken = await firebaseUser.getIdToken();
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = (await res.json()) as { ok: boolean; user?: { uid: string; email?: string | null; role: 'user' | 'admin' } };

      if (!data.ok || data.user?.role !== 'admin') {
        await signOutFirebase();
        await fetch('/api/auth/session', { method: 'DELETE' });
        setError('Akun ini tidak punya akses admin.');
        setIsLoggedIn(false);
        setUser(null);
        return false;
      }

      setIsLoggedIn(true);
      setUser({ uid: data.user.uid, email: data.user.email });
      return true;
    } catch {
      setError('Gagal masuk. Coba lagi.');
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    await signOutFirebase();
    await fetch('/api/auth/session', { method: 'DELETE' });
    setIsLoggedIn(false);
    setUser(null);
  }, []);

  return { isLoggedIn, isLoading, user, error, login, logout };
}
