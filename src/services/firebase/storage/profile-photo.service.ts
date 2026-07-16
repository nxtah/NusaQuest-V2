import { deleteObject, getDownloadURL, uploadBytes } from 'firebase/storage';

import { storageRef } from '../../../lib/firebase/storage';
import type { UploadProfilePhotoResult } from '../../../types/firebase.types';
import { toFailure, toSuccess, type AppResult } from '../../../utils/result';

function createProfilePhotoPath(uid: string, fileName: string) {
  const safeFileName = fileName.replace(/\s+/g, '-').toLowerCase();
  return `users/${uid}/profile/${Date.now()}-${safeFileName}`;
}

export async function uploadProfilePhoto(
  uid: string,
  file: File,
): Promise<AppResult<UploadProfilePhotoResult>> {
  try {
    const path = createProfilePhotoPath(uid, file.name);
    const reference = storageRef(path);

    await uploadBytes(reference, file);
    const url = await getDownloadURL(reference);

    return toSuccess({ path, url });
  } catch (error) {
    return toFailure<UploadProfilePhotoResult>(error);
  }
}

export async function getProfilePhotoUrl(path: string): Promise<AppResult<string>> {
  try {
    const url = await getDownloadURL(storageRef(path));
    return toSuccess(url);
  } catch (error) {
    return toFailure<string>(error);
  }
}

export async function deleteProfilePhoto(path: string): Promise<AppResult<null>> {
  try {
    await deleteObject(storageRef(path));
    return toSuccess(null);
  } catch (error) {
    return toFailure<null>(error);
  }
}
