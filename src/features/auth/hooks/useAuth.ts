'use client';

import {signInWithGoogle, signOutFirebase} from '@/src/lib/firebase/auth';
import {updateUserProfile, upsertUserFromGoogle} from '@/src/services/firebase/firestore/users.service';
import {useAuthStore} from '@/src/store/useAuthStore';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const setUser = useAuthStore((state) => state.setUser);
  const reset = useAuthStore((state) => state.reset);

  const login = async (): Promise<boolean> => {
    const firebaseUser = await signInWithGoogle();
    // null happens when signInWithGoogle fell back to a full-page redirect —
    // the browser is already navigating away, nothing left to do here.
    if (!firebaseUser) return false;

    const result = await upsertUserFromGoogle(firebaseUser);
    if (!result.success) return false;

    setUser(result.data);
    return true;
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
