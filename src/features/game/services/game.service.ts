import {firebaseDb} from '@/src/lib/firebase/client';
import {ref, onValue, get, set, update} from 'firebase/database';

export interface GamePlayer {
  uid: string;
  name: string;
  photoURL?: string;
  joinedAt: string;
}

export interface GameQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  topic: string;
}

const ROOMS_PATH = 'rooms';
const QUESTIONS_PATH = 'questions';
const GAME_STATE_PATH = 'gameState';

/**
 * Fetch questions for a topic
 */
export async function getQuestions(topicID: string): Promise<GameQuestion[]> {
  if (!firebaseDb) return [];

  try {
    const questionsRef = ref(firebaseDb, `${QUESTIONS_PATH}/${topicID}`);
    const snapshot = await get(questionsRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.entries(data).map(([id, q]: [string, any]) => ({
        id,
        ...q,
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
}

/**
 * Shuffle array helper
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Initialize NusaCard game state
 */
export async function initializeNusaCardGameState(
  topicID: string,
  gameID: string,
  roomID: string,
  players: GamePlayer[],
  questions: GameQuestion[],
): Promise<void> {
  if (!firebaseDb) return;

  try {
    const gameStateRef = ref(firebaseDb, `${ROOMS_PATH}/${topicID}/${gameID}/${roomID}/${GAME_STATE_PATH}`);

    const initialState = {
      players,
      currentPlayerIndex: 0,
      gameStatus: 'playing',
      questions,
      gameStartedAt: new Date().toISOString(),
      gameWinnerUID: null,
      gameWinnerDisplayName: null,
      achievementAwarded: false,
    };

    await set(gameStateRef, initialState);
  } catch (error) {
    console.error('Error initializing NusaCard game state:', error);
  }
}

/**
 * Initialize Ular Tangga game state
 */
export async function initializeUlarTanggaGameState(
  topicID: string,
  gameID: string,
  roomID: string,
  players: GamePlayer[],
  questions: GameQuestion[],
): Promise<void> {
  if (!firebaseDb) return;

  try {
    const gameStateRef = ref(firebaseDb, `${ROOMS_PATH}/${topicID}/${gameID}/${roomID}/${GAME_STATE_PATH}`);

    const pionPositions = new Array(players.length).fill(0);
    const playerTimers = new Array(players.length).fill(30);

    const initialState = {
      players,
      currentPlayerIndex: 0,
      gameStatus: 'playing',
      questions,
      pionPositions,
      playerTimers,
      gameStartedAt: new Date().toISOString(),
      gameWinnerUID: null,
      gameWinnerDisplayName: null,
      achievementAwarded: false,
    };

    await set(gameStateRef, initialState);
  } catch (error) {
    console.error('Error initializing Ular Tangga game state:', error);
  }
}

/**
 * Listen to game state changes
 */
export function subscribeToGameState(
  topicID: string,
  gameID: string,
  roomID: string,
  callback: (gameState: any) => void,
): () => void {
  if (!firebaseDb) {
    callback(null);
    return () => { };
  }

  try {
    const gameStateRef = ref(firebaseDb, `${ROOMS_PATH}/${topicID}/${gameID}/${roomID}/${GAME_STATE_PATH}`);
    return onValue(gameStateRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        callback(null);
      }
    });
  } catch {
    callback(null);
    return () => { };
  }
}

/**
 * Update game state
 */
export async function updateGameState(
  topicID: string,
  gameID: string,
  roomID: string,
  updates: Record<string, any>,
): Promise<void> {
  if (!firebaseDb) return;

  try {
    const gameStateRef = ref(firebaseDb, `${ROOMS_PATH}/${topicID}/${gameID}/${roomID}/${GAME_STATE_PATH}`);
    await update(gameStateRef, updates);
  } catch (error) {
    console.error('Error updating game state:', error);
  }
}

/**
 * Set game status to 'playing' or 'finished'
 */
export async function setGameStatus(
  topicID: string,
  gameID: string,
  roomID: string,
  status: 'playing' | 'finished',
): Promise<void> {
  if (!firebaseDb) return;

  try {
    const statusRef = ref(firebaseDb, `${ROOMS_PATH}/${topicID}/${gameID}/${roomID}/gameStatus`);
    await set(statusRef, status);
  } catch (error) {
    console.error('Error setting game status:', error);
  }
}

/**
 * Cleanup game when players leave
 */
export async function cleanupGame(
  topicID: string,
  gameID: string,
  roomID: string,
): Promise<void> {
  if (!firebaseDb) return;

  try {
    const roomRef = ref(firebaseDb, `${ROOMS_PATH}/${topicID}/${gameID}/${roomID}`);
    await update(roomRef, {
      gameStatus: 'waiting',
      currentPlayers: 0,
      gameState: null,
    });
  } catch (error) {
    console.error('Error cleaning up game:', error);
  }
}
