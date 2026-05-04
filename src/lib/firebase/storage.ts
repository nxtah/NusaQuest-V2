import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
  type StorageReference,
} from 'firebase/storage';
import {
  assertFirebaseClientConfigured,
  firebaseStorage,
} from '@/src/lib/firebase/client';

export function getFirebaseStorage() {
  assertFirebaseClientConfigured();
  return firebaseStorage!;
}

export function storageRef(path: string): StorageReference {
  return ref(getFirebaseStorage(), path);
}

export const storageUploadBytes = uploadBytes;
export const storageGetDownloadUrl = getDownloadURL;
export const storageDeleteObject = deleteObject;
