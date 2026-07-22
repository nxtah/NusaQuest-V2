import { serverTimestamp, type FieldValue } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';

import type { AppUser } from '../../../types/auth';
import type { AppResult } from '../../../utils/result';

import { getDocument, setDocument, updateDocument, usersCollectionPath } from './base.service';

type UserDocument = AppUser & {
  createdAt: FieldValue | number;
  updatedAt: FieldValue | number;
};

function getUserDocument(uid: string): Promise<AppResult<UserDocument | null>> {
  return getDocument<UserDocument>(usersCollectionPath(), uid);
}

export function getUserProfile(uid: string): Promise<AppResult<AppUser | null>> {
  return getUserDocument(uid);
}

// Creates the profile doc on first sign-in; on every later sign-in it just
// refreshes the fields Google itself owns (name/email/photo) while leaving
// app-owned fields (role, firebasePhotoURL) exactly as they already are.
export async function upsertUserFromGoogle(firebaseUser: FirebaseUser): Promise<AppResult<AppUser>> {
  const existing = await getUserDocument(firebaseUser.uid);
  const existingProfile = existing.success ? existing.data : null;

  const profile: UserDocument = {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? existingProfile?.email ?? '',
    displayName: firebaseUser.displayName ?? existingProfile?.displayName ?? 'Nusa Player',
    googlePhotoURL: firebaseUser.photoURL ?? existingProfile?.googlePhotoURL ?? null,
    firebasePhotoURL: existingProfile?.firebasePhotoURL ?? null,
    role: existingProfile?.role ?? 'user',
    createdAt: existingProfile?.createdAt ?? serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const result = await setDocument<UserDocument>(usersCollectionPath(), firebaseUser.uid, profile);
  if (!result.success) return result;

  return { success: true, data: profile, error: null };
}

export function updateUserProfile(
  uid: string,
  payload: Partial<AppUser>,
): Promise<AppResult<Partial<AppUser>>> {
  return updateDocument(usersCollectionPath(), uid, {
    ...payload,
    updatedAt: serverTimestamp(),
  });
}
