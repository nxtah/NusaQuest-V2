import { serverTimestamp, type FieldValue } from 'firebase/firestore';

import type { AppResult } from '../../../utils/result';

import {
  addDocument,
  feedbackCollectionPath,
  listenToCollection,
} from './base.service';

export interface Feedback {
  userId: string;
  userName: string;
  gameType: 'ular-tangga' | 'nusa-card';
  regionId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAt?: FieldValue;
}

export type FeedbackRecord = Feedback & { id: string };

/** Dipanggil dari popup feedback abis satu game selesai. Append-only —
    firestore.rules nolak update/delete sama sekali (termasuk admin), biar
    catatannya jujur/gak diotak-atik. */
export function submitFeedback(
  feedback: Omit<Feedback, 'createdAt'>,
): Promise<AppResult<{ id: string }>> {
  return addDocument(feedbackCollectionPath(), {
    ...feedback,
    createdAt: serverTimestamp(),
  });
}

/** Realtime — dipake tab Monitoring di admin-v2. */
export function listenToFeedback(
  callback: (items: FeedbackRecord[]) => void,
): () => void {
  return listenToCollection<Feedback>(feedbackCollectionPath(), callback);
}
