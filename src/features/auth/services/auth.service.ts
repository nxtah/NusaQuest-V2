import type {User as FirebaseUser} from 'firebase/auth';
import {dbGet, dbRef, dbSet} from '@/src/lib/firebase/db';
import {
  onFirebaseAuthStateChanged,
  signInWithGooglePopup,
  signOutFirebase,
} from '@/src/lib/firebase/auth';
import {getFirebaseAuth} from '@/src/lib/firebase/auth';
import {
  storageGetDownloadUrl,
  storageRef,
  storageUploadBytes,
} from '@/src/lib/firebase/storage';
import type {AppUser} from '@/src/types/auth';

const USER_PATH = 'users';

function toAppUser(firebaseUser: FirebaseUser, existingUser?: Partial<AppUser> | null): AppUser {
  return {
    uid: firebaseUser.uid,
    email: existingUser?.email ?? firebaseUser.email ?? '',
    displayName: existingUser?.displayName ?? firebaseUser.displayName ?? 'Player',
    googlePhotoURL: existingUser?.googlePhotoURL ?? firebaseUser.photoURL,
    firebasePhotoURL: existingUser?.firebasePhotoURL ?? null,
    role: existingUser?.role === 'admin' ? 'admin' : 'user',
  };
}

async function setSessionCookie(idToken: string): Promise<void> {
  const response = await fetch('/api/auth/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({idToken}),
  });

  if (!response.ok) {
    throw new Error('Failed to sync server session cookie.');
  }
}

async function clearSessionCookie(): Promise<void> {
  try {
    await fetch('/api/auth/session', {
      method: 'DELETE',
    });
  } catch {
    // Ignored: local sign-out should still succeed when API is temporarily unreachable.
  }
}

export async function getUserData(uid: string): Promise<AppUser | null> {
  try {
    const snapshot = await dbGet(dbRef(`${USER_PATH}/${uid}`));
    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.val() as AppUser;
  } catch {
    return null;
  }
}

export async function saveNewUserData(userData: AppUser): Promise<void> {
  await dbSet(dbRef(`${USER_PATH}/${userData.uid}`), userData);
}

export async function updateUserData(userData: AppUser): Promise<void> {
  await dbSet(dbRef(`${USER_PATH}/${userData.uid}`), userData);
}

export async function ensureUserProfile(firebaseUser: FirebaseUser): Promise<AppUser> {
  const existing = await getUserData(firebaseUser.uid);
  const normalized = toAppUser(firebaseUser, existing);

  if (!existing) {
    await saveNewUserData(normalized);
  }

  return normalized;
}

export async function signInWithGoogle(): Promise<AppUser> {
  const result = await signInWithGooglePopup();
  const firebaseUser = result.user;
  const normalizedUser = await ensureUserProfile(firebaseUser);
  const idToken = await firebaseUser.getIdToken();

  await setSessionCookie(idToken);

  return normalizedUser;
}

export async function logout(): Promise<void> {
  await signOutFirebase();
  await clearSessionCookie();
}

export async function refreshSession(user?: FirebaseUser | null): Promise<void> {
  const currentUser = user ?? getFirebaseAuth().currentUser;
  if (!currentUser) {
    return;
  }

  const idToken = await currentUser.getIdToken(true);
  await setSessionCookie(idToken);
}

export function subscribeAuthState(
  onStateChange: (user: AppUser | null) => void,
): () => void {
  return onFirebaseAuthStateChanged(async (firebaseUser) => {
    try {
      if (!firebaseUser) {
        await clearSessionCookie();
        onStateChange(null);
        return;
      }

      const normalizedUser = await ensureUserProfile(firebaseUser);
      const idToken = await firebaseUser.getIdToken();
      await setSessionCookie(idToken);
      onStateChange(normalizedUser);
    } catch {
      onStateChange(null);
    }
  });
}

export async function uploadPhoto(file: File, userId: string): Promise<{downloadURL: string}> {
  const ref = storageRef(`profilePhotos/${userId}/${file.name}`);
  const snapshot = await storageUploadBytes(ref, file);
  const downloadURL = await storageGetDownloadUrl(snapshot.ref);
  return {downloadURL};
}
