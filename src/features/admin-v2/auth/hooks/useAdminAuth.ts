'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  signInWithGoogle,
  signOutFirebase,
  getAuthRedirectResult,
  onFirebaseAuthStateChanged,
} from '@/src/lib/firebase/auth';
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // Nyegah `completeLogin` jalan dobel dari 2 sumber (getAuthRedirectResult
  // DAN onFirebaseAuthStateChanged bisa nyala nyaris bersamaan abis balik
  // dari Google — lihat komentar di bawah) buat UID yang sama persis.
  const completingUidRef = useRef<string | null>(null);

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
    // Guard dobel-invoke: getAuthRedirectResult() DAN onFirebaseAuthStateChanged
    // (dua-duanya di bawah) bisa nyala nyaris bersamaan abis balik dari
    // Google buat UID yang sama — tanpa ini, dua POST /api/auth/session
    // nyaris bareng bisa balapan gak jelas (harmless tapi boros & bikin log
    // membingungkan pas debug).
    if (completingUidRef.current === firebaseUser.uid) return isLoggedIn;
    completingUidRef.current = firebaseUser.uid;
    setError(null);
    try {
      const idToken = await firebaseUser.getIdToken();
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = (await res.json()) as { ok: boolean; user?: { uid: string; email?: string | null; role: 'user' | 'admin' } };

      if (!data.ok || data.user?.role !== 'admin') {
        console.error('[admin-auth] Login ditolak — bukan admin atau session gagal dibuat.', {
          ok: data.ok,
          role: data.user?.role,
          email: firebaseUser.email,
        });
        await signOutFirebase();
        await fetch('/api/auth/session', { method: 'DELETE' });
        setError(
          `Akun "${firebaseUser.email ?? ''}" tidak punya akses admin. Hubungi admin lain untuk diberi akses.`,
        );
        setIsLoggedIn(false);
        setUser(null);
        completingUidRef.current = null;
        return false;
      }

      setSuccessMessage('Berhasil masuk! Mengalihkan ke dashboard admin...');
      setIsLoggedIn(true);
      setUser({ uid: data.user.uid, email: data.user.email });
      return true;
    } catch (err) {
      console.error('[admin-auth] completeLogin gagal:', err);
      setError('Gagal masuk. Coba lagi.');
      completingUidRef.current = null;
      return false;
    }
  }, [isLoggedIn]);

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
  //
  // CATATAN PENTING: `getAuthRedirectResult()` (alias `getRedirectResult`
  // Firebase) BUKAN satu-satunya pemanggil di app ini — `providers.tsx` di
  // root layout JUGA manggil fungsi yang sama secara global di SETIAP
  // halaman (termasuk /admin) buat nangkep hasil redirect punya login USER
  // biasa. Firebase SDK gak selalu konsisten ngasih hasil yang sama ke DUA
  // pemanggil `getRedirectResult()` yang nyaris bersamaan di halaman yang
  // sama (di beberapa versi SDK, pemanggil pertama yang "berhasil klaim"
  // hasilnya, yang kedua bisa kebagian `null` walau login-nya sendiri
  // beneran sukses) — inilah kemungkinan BESAR kenapa fix sebelumnya
  // (cuma pake getAuthRedirectResult doang) masih kadang nyangkut. Makanya
  // di bawah ditambah `onFirebaseAuthStateChanged` sebagai jalur utama yang
  // JAUH lebih bisa diandalkan: dia nyala tiap kali Firebase Auth SDK
  // BENERAN punya user aktif — gak peduli itu dari redirect, dari sesi
  // yang udah ke-persist sebelumnya, atau dari cara apapun — dan gak
  // "diperebutkan" sama listener lain kayak getRedirectResult().
  useEffect(() => {
    getAuthRedirectResult()
      .then((result) => {
        if (result?.user) void completeLogin(result.user);
      })
      .catch((err) => {
        console.error('[admin-auth] getAuthRedirectResult gagal:', err);
        setError('Gagal masuk. Coba lagi.');
      });
  }, [completeLogin]);

  // Jalur UTAMA yang beneran nyelesain login abis balik dari redirect
  // Google — lihat catatan panjang di atas kenapa getAuthRedirectResult()
  // doang gak cukup diandalkan di halaman ini.
  useEffect(() => {
    const unsubscribe = onFirebaseAuthStateChanged((firebaseUser) => {
      if (firebaseUser) void completeLogin(firebaseUser);
    });
    return unsubscribe;
  }, [completeLogin]);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  const login = useCallback(async (): Promise<boolean> => {
    setError(null);
    setSuccessMessage(null);
    try {
      const firebaseUser = await signInWithGoogle();
      if (!firebaseUser) return false; // redirect flow kicked in, ditangani completeLogin abis balik

      return await completeLogin(firebaseUser);
    } catch (err) {
      console.error('[admin-auth] login gagal:', err);
      setError('Gagal masuk. Coba lagi.');
      return false;
    }
  }, [completeLogin]);

  const logout = useCallback(async () => {
    await signOutFirebase();
    await fetch('/api/auth/session', { method: 'DELETE' });
    completingUidRef.current = null;
    setIsLoggedIn(false);
    setUser(null);
    setSuccessMessage(null);
  }, []);

  return { isLoggedIn, isLoading, user, error, successMessage, login, logout };
}
