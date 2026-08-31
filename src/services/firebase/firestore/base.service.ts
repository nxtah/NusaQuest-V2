import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  type DocumentData,
  type UpdateData,
} from 'firebase/firestore';

import { firebaseFirestore } from '../../../lib/firebase/client';
import { toFailure, toSuccess, type AppResult } from '../../../utils/result';

function requireFirestore() {
  if (!firebaseFirestore) {
    throw new Error('Firestore is not configured. Please set NEXT_PUBLIC_FIREBASE_* environment variables.');
  }
  return firebaseFirestore;
}

export async function getDocument<T extends DocumentData>(
  collectionPath: string,
  id: string,
): Promise<AppResult<(T & { id: string }) | null>> {
  try {
    const snapshot = await getDoc(doc(requireFirestore(), collectionPath, id));
    const value = snapshot.exists() ? { id: snapshot.id, ...(snapshot.data() as T) } : null;
    return toSuccess(value);
  } catch (error) {
    return toFailure<(T & { id: string }) | null>(error);
  }
}

export async function setDocument<T extends DocumentData>(
  collectionPath: string,
  id: string,
  payload: T,
): Promise<AppResult<T>> {
  try {
    await setDoc(doc(requireFirestore(), collectionPath, id), payload, { merge: true });
    return toSuccess(payload);
  } catch (error) {
    return toFailure<T>(error);
  }
}

export async function updateDocument<T extends Record<string, unknown>>(
  collectionPath: string,
  id: string,
  payload: T,
): Promise<AppResult<T>> {
  try {
    await updateDoc(doc(requireFirestore(), collectionPath, id), payload as UpdateData<DocumentData>);
    return toSuccess(payload);
  } catch (error) {
    return toFailure<T>(error);
  }
}

export async function getCollectionDocs<T extends DocumentData>(
  collectionPath: string,
): Promise<AppResult<(T & { id: string })[]>> {
  try {
    const snapshot = await getDocs(collection(requireFirestore(), collectionPath));
    const items = snapshot.docs.map((docSnapshot) => ({
      id: docSnapshot.id,
      ...(docSnapshot.data() as T),
    }));
    return toSuccess(items);
  } catch (error) {
    return toFailure<(T & { id: string })[]>(error);
  }
}

export async function addDocument<T extends DocumentData>(
  collectionPath: string,
  payload: T,
): Promise<AppResult<{ id: string }>> {
  try {
    const docRef = await addDoc(collection(requireFirestore(), collectionPath), payload);
    return toSuccess({ id: docRef.id });
  } catch (error) {
    return toFailure<{ id: string }>(error);
  }
}

export async function deleteDocument(
  collectionPath: string,
  id: string,
): Promise<AppResult<null>> {
  try {
    await deleteDoc(doc(requireFirestore(), collectionPath, id));
    return toSuccess(null);
  } catch (error) {
    return toFailure<null>(error);
  }
}

/** Listener realtime generik — dipake buat tabel admin & halaman publik
    yang butuh update langsung tanpa refresh manual (mis. /information,
    /credit, dan tabel-tabel admin-v2). */
export function listenToCollection<T extends DocumentData>(
  collectionPath: string,
  callback: (items: (T & { id: string })[]) => void,
): () => void {
  return onSnapshot(collection(requireFirestore(), collectionPath), (snapshot) => {
    callback(snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...(docSnapshot.data() as T) })));
  });
}

export function usersCollectionPath() {
  return 'users';
}

export function informationItemsCollectionPath() {
  return 'informationItems';
}

export function creditsCollectionPath() {
  return 'credits';
}

export function creditSectionsCollectionPath() {
  return 'creditSections';
}
