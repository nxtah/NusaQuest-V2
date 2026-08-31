import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
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
  /** 4 pilihan ganda asli — sebelumnya cuma 1 `answer` bebas teks yang di-pad
      3 string kosong pas ditulis ke Firestore, bikin soal buatan admin
      keluar di game beneran dengan 3 tombol jawaban kosong. */
  options: [string, string, string, string];
  correctIndex: number;
  /** Id region ASLI (`regions/{regionId}`, mis. `kuliner_pa`) — sebelumnya
      cuma label kategori bebas (`DAERAH`/`KULINER`/dst) yang gak nyambung
      sama skema `regionId` yang beneran dipake query game. */
  regionId: string;
  gameId?: string;
  createdAt?: number;
  updatedAt?: number;
}

function toAdminQuestion(doc: FirestoreQuestion & { id: string }): AdminQuestion {
  const options = doc.options ?? ['', '', '', ''];
  return {
    id: doc.id,
    question: doc.text,
    options: [options[0] ?? '', options[1] ?? '', options[2] ?? '', options[3] ?? ''],
    correctIndex: doc.correctIndex ?? 0,
    regionId: doc.regionId,
    gameId: doc.mapId,
    createdAt: doc.createdAt,
    updatedAt: doc.createdAt,
  };
}

function toFirestoreQuestion(data: {
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  regionId: string;
  gameId: string;
}, existing?: Partial<FirestoreQuestion>): FirestoreQuestion {
  return {
    questionId: existing?.questionId ?? '',
    regionId: data.regionId,
    mapId: data.gameId,
    text: data.question,
    options: data.options,
    correctIndex: (data.correctIndex >= 0 && data.correctIndex <= 3 ? data.correctIndex : 0) as 0 | 1 | 2 | 3,
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

/** Realtime — dipake tabel admin biar soal baru/edit dari tab/admin lain
    langsung kelihatan tanpa refresh manual. */
export function listenToGameQuestions(
  gameId: string,
  callback: (questions: Record<string, AdminQuestion>) => void,
): () => void {
  const q = query(
    collection(getDb(), QUESTIONS_COLLECTION),
    where('mapId', '==', gameId),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(q, (snapshot) => {
    const result: Record<string, AdminQuestion> = {};
    snapshot.docs.forEach((docSnap) => {
      const data = { id: docSnap.id, ...docSnap.data() } as FirestoreQuestion & { id: string };
      result[docSnap.id] = toAdminQuestion(data);
    });
    callback(result);
  });
}

export async function createQuestion(
  gameId: string,
  questionData: Omit<AdminQuestion, 'id' | 'gameId'>,
): Promise<AppResult<{ id: string }>> {
  try {
    const data = toFirestoreQuestion({
      question: questionData.question,
      options: questionData.options,
      correctIndex: questionData.correctIndex,
      regionId: questionData.regionId,
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
    if (updates.options) patch.options = updates.options;
    if (updates.correctIndex !== undefined) patch.correctIndex = updates.correctIndex;
    if (updates.regionId) patch.regionId = updates.regionId;
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
