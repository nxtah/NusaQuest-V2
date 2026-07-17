import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { firebaseFirestore } from '@/src/lib/firebase/client';
import { toFailure, toSuccess, type AppResult } from '@/src/utils/result';
import type { Question as FirestoreQuestion } from '@/src/types/firestore';

const QUESTIONS_COLLECTION = 'questions';

function getDb() {
  if (!firebaseFirestore) throw new Error('Firestore not configured');
  return firebaseFirestore;
}

export interface AdminQuestion {
  id?: string;
  question: string;
  answer: string;
  topic: string;
  gameId?: string;
  createdAt?: number;
  updatedAt?: number;
}

function toAdminQuestion(doc: FirestoreQuestion & { id: string }): AdminQuestion {
  return {
    id: doc.id,
    question: doc.text,
    answer: doc.options[doc.correctIndex] ?? '',
    topic: doc.regionId,
    gameId: doc.mapId,
    createdAt: doc.createdAt,
    updatedAt: doc.createdAt,
  };
}

function toFirestoreQuestion(data: {
  question: string;
  answer: string;
  topic: string;
  gameId: string;
}, existing?: Partial<FirestoreQuestion>): FirestoreQuestion {
  return {
    questionId: existing?.questionId ?? '',
    regionId: data.topic,
    mapId: data.gameId,
    text: data.question,
    options: existing?.options ?? [data.answer, '', '', ''],
    correctIndex: existing?.correctIndex ?? 0,
    difficulty: 'easy',
    isActive: existing?.isActive ?? true,
    isApproved: existing?.isApproved ?? true,
    generatedBy: existing?.generatedBy ?? 'manual',
    createdAt: existing?.createdAt ?? Date.now(),
  };
}

export async function getGameQuestions(
  gameId: string,
): Promise<AppResult<Record<string, AdminQuestion> | null>> {
  try {
    const q = query(
      collection(getDb(), QUESTIONS_COLLECTION),
      where('mapId', '==', gameId),
      orderBy('createdAt', 'desc'),
    );
    const snapshot = await getDocs(q);
    const result: Record<string, AdminQuestion> = {};
    snapshot.docs.forEach((docSnap) => {
      const data = { id: docSnap.id, ...docSnap.data() } as FirestoreQuestion & { id: string };
      result[docSnap.id] = toAdminQuestion(data);
    });
    return toSuccess(Object.keys(result).length > 0 ? result : null);
  } catch (error) {
    return toFailure<Record<string, AdminQuestion> | null>(error);
  }
}

export async function createQuestion(
  gameId: string,
  questionData: Omit<AdminQuestion, 'id' | 'gameId'>,
): Promise<AppResult<{ id: string }>> {
  try {
    const data = toFirestoreQuestion({
      question: questionData.question,
      answer: questionData.answer,
      topic: questionData.topic,
      gameId,
    });
    const docRef = await addDoc(collection(getDb(), QUESTIONS_COLLECTION), data);
    return toSuccess({ id: docRef.id });
  } catch (error) {
    return toFailure<{ id: string }>(error);
  }
}

export async function updateQuestion(
  gameId: string,
  questionId: string,
  updates: Partial<Omit<AdminQuestion, 'id' | 'gameId'>>,
): Promise<AppResult<Partial<AdminQuestion>>> {
  try {
    const ref = doc(getDb(), QUESTIONS_COLLECTION, questionId);
    const patch: Record<string, unknown> = {};
    if (updates.question) patch.text = updates.question;
    if (updates.answer) {
      patch.options = [updates.answer, '', '', ''];
      patch.correctIndex = 0;
    }
    if (updates.topic) patch.regionId = updates.topic;
    await updateDoc(ref, patch);
    return toSuccess({
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (error) {
    return toFailure<Partial<AdminQuestion>>(error);
  }
}

export async function deleteQuestion(
  _gameId: string,
  questionId: string,
): Promise<AppResult<null>> {
  try {
    await deleteDoc(doc(getDb(), QUESTIONS_COLLECTION, questionId));
    return toSuccess(null);
  } catch (error) {
    return toFailure<null>(error);
  }
}
