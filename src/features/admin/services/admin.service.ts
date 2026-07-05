import {firebaseDb} from '@/src/lib/firebase/client';
import {ref, onValue, get, set, update, remove} from 'firebase/database';
import type {AdminQuestion, AdminTopic, AdminGame, AdminUser} from '@/src/features/admin/types/admin.types';

const QUESTIONS_PATH = 'questions';
const TOPICS_PATH = 'topics';
const GAMES_PATH = 'games';
const USERS_PATH = 'users';

/**
 * Subscribe to all questions for a topic
 */
export function subscribeAdminQuestions(
  topicID: string,
  callback: (questions: Record<string, AdminQuestion>) => void,
): () => void {
  if (!firebaseDb) {
    callback({});
    return () => { };
  }

  try {
    const questionsRef = ref(firebaseDb, `${QUESTIONS_PATH}/${topicID}`);
    return onValue(questionsRef, (snapshot) => {
      callback(snapshot.val() || {});
    });
  } catch {
    callback({});
    return () => { };
  }
}

/**
 * Create new question
 */
export async function createQuestion(
  topicID: string,
  question: Omit<AdminQuestion, 'id'>,
): Promise<string> {
  if (!firebaseDb) throw new Error('Database not initialized');

  try {
    const newQuestionRef = ref(firebaseDb, `${QUESTIONS_PATH}/${topicID}/${Date.now()}`);
    await set(newQuestionRef, question);
    return Date.now().toString();
  } catch (error) {
    console.error('Error creating question:', error);
    throw error;
  }
}

/**
 * Update existing question
 */
export async function updateQuestion(
  topicID: string,
  questionID: string,
  updates: Partial<AdminQuestion>,
): Promise<void> {
  if (!firebaseDb) return;

  try {
    const questionRef = ref(firebaseDb, `${QUESTIONS_PATH}/${topicID}/${questionID}`);
    await update(questionRef, updates);
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
}

/**
 * Delete question
 */
export async function deleteQuestion(topicID: string, questionID: string): Promise<void> {
  if (!firebaseDb) return;

  try {
    const questionRef = ref(firebaseDb, `${QUESTIONS_PATH}/${topicID}/${questionID}`);
    await remove(questionRef);
  } catch (error) {
    console.error('Error deleting question:', error);
  }
}

/**
 * Subscribe to all topics
 */
export function subscribeAdminTopics(
  callback: (topics: Record<string, AdminTopic>) => void,
): () => void {
  if (!firebaseDb) {
    callback({});
    return () => { };
  }

  try {
    const topicsRef = ref(firebaseDb, TOPICS_PATH);
    return onValue(topicsRef, (snapshot) => {
      callback(snapshot.val() || {});
    });
  } catch {
    callback({});
    return () => { };
  }
}

/**
 * Subscribe to all users
 */
export function subscribeAdminUsers(
  callback: (users: Record<string, AdminUser>) => void,
): () => void {
  if (!firebaseDb) {
    callback({});
    return () => { };
  }

  try {
    const usersRef = ref(firebaseDb, USERS_PATH);
    return onValue(usersRef, (snapshot) => {
      callback(snapshot.val() || {});
    });
  } catch {
    callback({});
    return () => { };
  }
}
