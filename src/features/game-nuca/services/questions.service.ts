import { firebaseFirestore } from '@/src/lib/firebase/client'

function requireFirestore() {
  if (!firebaseFirestore) throw new Error('Firestore not configured');
  return firebaseFirestore;
}
import {
  collection,
  getDocs,
  query,
  where,
  and,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  doc,
} from 'firebase/firestore'
import { Question } from '@/src/types/firestore'

const QUESTIONS_COLLECTION = 'questions'

/**
 * Fetch questions for a specific map & region (approved only)
 */
export async function getQuestions(
  mapId: string,
  regionId: string,
  limit_count: number = 50
): Promise<Question[]> {
  try {
    const q = query(
      collection(requireFirestore(), QUESTIONS_COLLECTION),
      and(
        where('mapId', '==', mapId),
        where('regionId', '==', regionId),
        where('isActive', '==', true),
        where('isApproved', '==', true)
      ),
      orderBy('createdAt', 'desc'),
      limit(limit_count)
    )
    const snapshot = await getDocs(q)
    const questions: Question[] = snapshot.docs.map((doc) => ({
      ...doc.data(),
      questionId: doc.data().questionId || doc.id,
    } as Question))
    return questions
  } catch (error) {
    console.error('Error fetching questions:', error)
    throw error
  }
}

/**
 * Fetch questions for a map (all regions). Filters by mapId only — no compound
 * index needed. isActive/isApproved filtering done client-side so the query
 * works without a Firestore composite index being deployed.
 */
export async function getQuestionsByMap(
  mapId: string,
  limit_count: number = 100
): Promise<Question[]> {
  try {
    const q = query(
      collection(requireFirestore(), QUESTIONS_COLLECTION),
      where('mapId', '==', mapId),
      limit(limit_count)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs
      .map((d) => ({ ...d.data(), questionId: d.data().questionId || d.id } as Question))
      .filter((q) => q.isActive !== false && q.isApproved !== false)
  } catch (error) {
    console.error('Error fetching questions by map:', error)
    throw error
  }
}

/**
 * Fetch questions for a specific map + region. Filters by mapId only in the
 * Firestore query (no compound index needed) — regionId/isActive/isApproved
 * filtering done client-side, same strategy as getQuestionsByMap.
 */
export async function getQuestionsByRegion(
  mapId: string,
  regionId: string,
  limit_count: number = 100
): Promise<Question[]> {
  try {
    const q = query(
      collection(requireFirestore(), QUESTIONS_COLLECTION),
      where('mapId', '==', mapId),
      limit(limit_count)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs
      .map((d) => ({ ...d.data(), questionId: d.data().questionId || d.id } as Question))
      .filter((q) => q.regionId === regionId && q.isActive !== false && q.isApproved !== false)
  } catch (error) {
    console.error('Error fetching questions by region:', error)
    throw error
  }
}

/**
 * Fetch unapproved questions (admin only)
 */
export async function getUnapprovedQuestions(
  mapId: string,
  regionId: string
): Promise<Question[]> {
  try {
    const q = query(
      collection(requireFirestore(), QUESTIONS_COLLECTION),
      and(
        where('mapId', '==', mapId),
        where('regionId', '==', regionId),
        where('isApproved', '==', false)
      ),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    const questions: Question[] = snapshot.docs.map((doc) => ({
      ...doc.data(),
      questionId: doc.data().questionId || doc.id,
    } as Question))
    return questions
  } catch (error) {
    console.error('Error fetching unapproved questions:', error)
    throw error
  }
}

// Generate-with-AI dulu di sini (client-side, baca process.env.OPENROUTER_API_KEY
// yang SELALU undefined di browser tanpa prefix NEXT_PUBLIC_ — makanya gak
// pernah beneran jalan). Digantikan oleh /api/admin/questions/generate/route.ts
// (server-side, key gak pernah nyampe client).

/**
 * Save generated questions to Firestore (admin only)
 */
export async function saveQuestions(questions: Question[]): Promise<string[]> {
  try {
    const ids: string[] = []
    for (const question of questions) {
      const docRef = await addDoc(collection(requireFirestore(), QUESTIONS_COLLECTION), question)
      ids.push(docRef.id)
    }
    return ids
  } catch (error) {
    console.error('Error saving questions:', error)
    throw error
  }
}

/**
 * Approve question (admin only)
 */
export async function approveQuestion(
  questionId: string,
  adminUid: string
): Promise<void> {
  try {
    const qRef = doc(requireFirestore(), QUESTIONS_COLLECTION, questionId)
    await updateDoc(qRef, {
      isApproved: true,
      approvedAt: Date.now(),
      approvedBy: adminUid,
    })
  } catch (error) {
    console.error('Error approving question:', error)
    throw error
  }
}

/**
 * Reject question (admin only) - soft delete
 */
export async function rejectQuestion(questionId: string): Promise<void> {
  try {
    const qRef = doc(requireFirestore(), QUESTIONS_COLLECTION, questionId)
    await updateDoc(qRef, {
      isActive: false,
    })
  } catch (error) {
    console.error('Error rejecting question:', error)
    throw error
  }
}
