import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  type User,
} from 'firebase/auth';
import {
  assertFirebaseClientConfigured,
  firebaseAuth,
} from '@/src/lib/firebase/client';

const googleProvider = new GoogleAuthProvider();

export function getFirebaseAuth() {
  assertFirebaseClientConfigured();
  return firebaseAuth!;
}

// SELALU redirect, jangan popup. `signInWithPopup` butuh iframe
// `authDomain` (nusaquest-v2-bd551.firebaseapp.com) ngobrol balik ke tab
// pembuka lewat cross-origin storage — begitu authDomain beda origin dari
// domain app-nya sendiri (kasus kita di Vercel), Chrome versi baru nge-
// partition storage itu ("Partitioned cookie or storage access..." di
// console) dan hasil login GAK PERNAH nyampe balik ke tab utama, popup-nya
// sendiri gak "blocked" jadi fallback lama (yang cuma nyala pas
// auth/popup-blocked) gak pernah ke-trigger. Redirect gak butuh channel
// cross-window itu sama sekali, jadi imun dari masalah ini.
export async function signInWithGoogle(): Promise<User | null> {
  await signInWithRedirect(getFirebaseAuth(), googleProvider);
  return null;
}

export async function getAuthRedirectResult() {
  return getRedirectResult(getFirebaseAuth());
}

export async function signOutFirebase() {
  await signOut(getFirebaseAuth());
}

export function onFirebaseAuthStateChanged(
  callback: (user: User | null) => void,
) {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}
