'use client';

import {signInWithGoogle, signOutFirebase} from '@/src/lib/firebase/auth';
import {updateUserProfile, upsertUserFromGoogle} from '@/src/services/firebase/firestore/users.service';
import {useAuthStore} from '@/src/store/useAuthStore';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const setUser = useAuthStore((state) => state.setUser);
  const reset = useAuthStore((state) => state.reset);

  // 'redirecting' BUKAN kegagalan — signInWithGoogle() SELALU redirect
  // (lihat lib/firebase/auth.ts), null di sini artinya browser lagi
  // navigasi ke accounts.google.com. Caller harus bedain ini dari 'failed'
  // beneran, biar tombol login gak nge-shake/reset kayak abis gagal padahal
  // cuma lagi pindah halaman.
  const login = async (): Promise<'success' | 'redirecting' | 'failed'> => {
    const firebaseUser = await signInWithGoogle();
    if (!firebaseUser) return 'redirecting';

    const result = await upsertUserFromGoogle(firebaseUser);
    if (!result.success) return 'failed';

    setUser(result.data);
    return 'success';
  };

  const logout = async () => {
    await signOutFirebase();
    reset();
  };

  // Dipanggil abis popup perkenalan ke-dismiss — update local store LANGSUNG
  // (biar gak nongol lagi kalau pindah halaman terus balik ke home di sesi
  // yang sama) sekalian nulis ke Firestore (biar gak nongol lagi di sesi
  // berikutnya juga).
  const markIntroSeen = async () => {
    if (!user) return;
    setUser({...user, hasSeenIntro: true});
    await updateUserProfile(user.uid, {hasSeenIntro: true});
  };

  return {
    user,
    isLoggedIn: user !== null,
    isInitialized,
    login,
    logout,
    markIntroSeen,
  };
}
