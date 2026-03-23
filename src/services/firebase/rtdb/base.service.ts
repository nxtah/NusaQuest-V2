import {
  get,
  off,
  onValue,
  push,
  remove,
  set,
  update,
} from 'firebase/database';

import { dbRef } from '../../../lib/firebase/db';
import { toFailure, toSuccess, type AppResult } from '../../../utils/result';

export async function setData<T>(path: string, payload: T): Promise<AppResult<T>> {
  try {
    await set(dbRef(path), payload);
    return toSuccess(payload);
  } catch (error) {
    return toFailure<T>(error);
  }
}

export async function getData<T>(path: string): Promise<AppResult<T | null>> {
  try {
    const snapshot = await get(dbRef(path));
    const value = snapshot.exists() ? (snapshot.val() as T) : null;
    return toSuccess(value);
  } catch (error) {
    return toFailure<T | null>(error);
  }
}

export async function updateData<T extends Record<string, unknown>>(
  path: string,
  payload: T,
): Promise<AppResult<T>> {
  try {
    await update(dbRef(path), payload);
    return toSuccess(payload);
  } catch (error) {
    return toFailure<T>(error);
  }
}

export async function removeData(path: string): Promise<AppResult<null>> {
  try {
    await remove(dbRef(path));
    return toSuccess(null);
  } catch (error) {
    return toFailure<null>(error);
  }
}

export async function pushData<T>(path: string, payload: T): Promise<AppResult<{ id: string }>> {
  try {
    const reference = dbRef(path);
    const newRecordRef = push(reference);
    await set(newRecordRef, payload);

    return toSuccess({
      id: newRecordRef.key ?? '',
    });
  } catch (error) {
    return toFailure<{ id: string }>(error);
  }
}

export function subscribeData<T>(
  path: string,
  onChange: (data: T | null) => void,
  onError?: (message: string) => void,
): () => void {
  const reference = dbRef(path);

  onValue(
    reference,
    (snapshot) => {
      onChange(snapshot.exists() ? (snapshot.val() as T) : null);
    },
    (error) => {
      onError?.(error.message);
    },
  );

  return () => off(reference);
}

export function roomPath(topicId: string, gameId: string, roomId: string) {
  return `rooms/${topicId}/${gameId}/${roomId}`;
}

export function userPath(uid: string) {
  return `users/${uid}`;
}

export function gameStatePath(roomId: string) {
  return `games/state/${roomId}`;
}

export function roomChatPath(roomId: string) {
  return `rooms/chat/${roomId}`;
}
