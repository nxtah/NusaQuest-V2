'use client';

import { useCallback, useEffect, useState } from 'react';
import { signInWithGoogle, signOutFirebase, getAuthRedirectResult } from '@/src/lib/firebase/auth';
import type { User } from 'firebase/auth';

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

  // Nyelesaiin login abis Firebase Auth-nya beneran sukses — dipanggil dari
  // dua tempat: efek redirect-result di bawah (jalur NYATA yang kepake,
  // karena signInWithGoogle() SELALU signInWithRedirect) dan `login()`
  // sendiri (dijaga buat masa depan kalau alurnya pernah ganti balik ke
  // popup, gak nyakitin biarin dobel).
  const completeLogin = useCallback(async (firebaseUser: User): Promise<boolean> => {
    try {
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

  // `signInWithGoogle()` SELALU signInWithRedirect (full-page navigasi ke
  // accounts.google.com) — begitu balik ke halaman ini, itu RELOAD PENUH
  // (hook ini mount ulang dari nol), bukan lanjutan `login()` di bawah
  // (yang udah kepotong browser-nya navigasi pergi duluan sebelum sempet
  // jalan lebih jauh dari situ). Tanpa efek ini, gak ada apapun yang
  // manggil getIdToken()/POST session abis balik dari Google — cookie
  // session-nya gak pernah kebikin, checkSession() di atas selalu liat
  // "belum login", dan halaman admin nyangkut di layar login SELAMANYA
  // walau login Google-nya sendiri beneran sukses. Pola yang sama persis
  // kayak fix login user biasa di LoginCard.tsx/providers.tsx.
  useEffect(() => {
    getAuthRedirectResult()
      .then((result) => {
        if (result?.user) return completeLogin(result.user);
      })
      .catch(() => {
        setError('Gagal masuk. Coba lagi.');
      });
  }, [completeLogin]);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  const login = useCallback(async (): Promise<boolean> => {
    setError(null);
    try {
      const firebaseUser = await signInWithGoogle();
      if (!firebaseUser) return false; // redirect flow kicked in, ditangani completeLogin abis balik

      return await completeLogin(firebaseUser);
    } catch {
      setError('Gagal masuk. Coba lagi.');
      return false;
    }
  }, [completeLogin]);

  const logout = useCallback(async () => {
    await signOutFirebase();
    await fetch('/api/auth/session', { method: 'DELETE' });
    setIsLoggedIn(false);
    setUser(null);
  }, []);

  return { isLoggedIn, isLoading, user, error, login, logout };
}
