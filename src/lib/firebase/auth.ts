import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
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

export async function signInWithGooglePopup() {
  return signInWithPopup(getFirebaseAuth(), googleProvider);
}

export async function signOutFirebase() {
  await signOut(getFirebaseAuth());
}

export function onFirebaseAuthStateChanged(
  callback: (user: User | null) => void,
) {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}
