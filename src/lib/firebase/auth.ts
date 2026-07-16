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

// Returns the signed-in User directly (rather than leaving callers to poll
// currentUser or wait on the onAuthStateChanged listener) so a caller like
// useAuth().login() can deterministically act on *this* sign-in, not
// whichever auth state happens to be current when the listener next fires.
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const credential = await signInWithPopup(getFirebaseAuth(), googleProvider);
    return credential.user;
  } catch (error) {
    // Only fall back to a full-page redirect when the popup itself couldn't
    // open (browser blocked it) — not when the user closed it or denied
    // consent, which must surface as a real failure to the caller.
    const code = (error as {code?: string}).code;
    if (code === 'auth/popup-blocked') {
      await signInWithRedirect(getFirebaseAuth(), googleProvider);
      return null;
    }
    throw error;
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
