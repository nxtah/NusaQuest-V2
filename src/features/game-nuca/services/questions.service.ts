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
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

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
    } as Question))
    return questions
  } catch (error) {
    console.error('Error fetching questions:', error)
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
    } as Question))
    return questions
  } catch (error) {
    console.error('Error fetching unapproved questions:', error)
    throw error
  }
}

/**
 * Generate questions using OpenRouter AI
 */
export async function generateQuestionsWithAI(params: {
  mapId: string
  regionId: string
  regionName: string
  mapCategory: string
  count: number
}): Promise<Question[]> {
  try {
    const { mapId, regionId, regionName, mapCategory, count } = params

    const prompt = `Generate ${count} multiple choice questions about ${mapCategory} in ${regionName}, Indonesia.

Format EXACTLY as JSON array with no additional text:
[
  {
    "text": "Question here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0
  }
]

Requirements:
- Each question must have exactly 4 options
- correctIndex must be 0-3 (position of correct answer)
- Questions should be educational and accurate
- Suitable for all ages`

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    // Parse JSON from response
    let generatedQuestions
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('No JSON array found in response')
      }
      generatedQuestions = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error('Failed to parse AI response:', content)
      throw new Error('Failed to parse AI-generated questions')
    }

    // Transform to Question objects
    const questions: Question[] = generatedQuestions.map(
      (q: any, index: number) => ({
        regionId,
        mapId,
        text: q.text,
        options: q.options,
        correctIndex: q.correctIndex,
        difficulty: 'easy',
        isActive: false,
        isApproved: false,
        generatedBy: 'ai',
        createdAt: Date.now(),
        approvedAt: null,
        approvedBy: null,
      })
    )

    return questions
  } catch (error) {
    console.error('Error generating questions with AI:', error)
    throw error
  }
}

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
