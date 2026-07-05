import {
  get,
  onChildAdded,
  onValue,
  push,
  ref,
  remove,
  runTransaction,
  set,
  update,
  type DatabaseReference,
} from 'firebase/database';
import {
  assertFirebaseClientConfigured,
  firebaseDb,
} from '@/src/lib/firebase/client';

export function getFirebaseDb() {
  assertFirebaseClientConfigured();
  return firebaseDb!;
}

export function dbRef(path: string): DatabaseReference {
  return ref(getFirebaseDb(), path);
}

export const dbGet = get;
export const dbSet = set;
export const dbUpdate = update;
export const dbPush = push;
export const dbRemove = remove;
export const dbOnValue = onValue;
export const dbOnChildAdded = onChildAdded;
export const dbRunTransaction = runTransaction;
