import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
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

export async function signInWithGoogle() {
  // Try popup first; if COOP blocks it, fall back to redirect
  try {
    await signInWithPopup(getFirebaseAuth(), googleProvider);
  } catch {
    await signInWithRedirect(getFirebaseAuth(), googleProvider);
  }
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
