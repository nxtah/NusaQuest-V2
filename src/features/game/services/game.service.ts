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

interface QuestionRecord {
  question: string;
  options: string[];
  correctAnswer: number;
  topic: string;
  [key: string]: unknown;
}

export interface BaseGameState {
  players: GamePlayer[];
  currentPlayerIndex: number;
  gameStatus: 'playing' | 'finished' | 'waiting';
  questions: GameQuestion[];
  gameStartedAt: string;
  gameWinnerUID: string | null;
  gameWinnerDisplayName: string | null;
  achievementAwarded: boolean;
}

export interface NusaCardGameState extends BaseGameState {
  currentQuestionIndex?: number;
  lastActionByUID?: string | null;
  lastActionAt?: string | null;
  turnPhase?: string;
}

export interface UlarTanggaGameState extends BaseGameState {
  pionPositions: number[];
  playerTimers: number[];
  lastDiceRoll?: number;
  lastMovedByUID?: string | null;
  lastMovedAt?: string | null;
  turnPhase?: string;
}

const ROOMS_PATH = 'rooms';
const QUESTIONS_PATH = 'questions';
const GAME_STATE_PATH = 'gameState';

function getRoomGameStateRef(topicID: string, gameID: string, roomID: string) {
  if (!firebaseDb) {
    throw new Error('Firebase database is not initialized');
  }

  return ref(firebaseDb, `${ROOMS_PATH}/${topicID}/${gameID}/${roomID}/${GAME_STATE_PATH}`);
}

function getRoomRef(topicID: string, gameID: string, roomID: string) {
  if (!firebaseDb) {
    throw new Error('Firebase database is not initialized');
  }

  return ref(firebaseDb, `${ROOMS_PATH}/${topicID}/${gameID}/${roomID}`);
}

/**
 * Fetch questions for a topic
 */
export async function getQuestions(topicID: string): Promise<GameQuestion[]> {
  if (!firebaseDb) return [];

  try {
    const questionsRef = ref(firebaseDb, `${QUESTIONS_PATH}/${topicID}`);
    const snapshot = await get(questionsRef);

    if (snapshot.exists()) {
      const data = snapshot.val() as Record<string, QuestionRecord>;
      return Object.entries(data).map(([id, q]) => ({
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
    const gameStateRef = getRoomGameStateRef(topicID, gameID, roomID);

    const initialState: NusaCardGameState = {
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
    const gameStateRef = getRoomGameStateRef(topicID, gameID, roomID);

    const pionPositions = new Array(players.length).fill(0);
    const playerTimers = new Array(players.length).fill(30);

    const initialState: UlarTanggaGameState = {
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
  callback: (gameState: BaseGameState | null) => void,
): () => void {
  return subscribeToTypedGameState<BaseGameState>(topicID, gameID, roomID, callback);
}

export function subscribeToTypedGameState<TGameState extends BaseGameState>(
  topicID: string,
  gameID: string,
  roomID: string,
  callback: (gameState: TGameState | null) => void,
): () => void {
  if (!firebaseDb) {
    callback(null);
    return () => { };
  }

  try {
    const gameStateRef = getRoomGameStateRef(topicID, gameID, roomID);
    return onValue(gameStateRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as TGameState);
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
  updates: Partial<BaseGameState> & Record<string, unknown>,
): Promise<void> {
  if (!firebaseDb) return;

  try {
    const gameStateRef = getRoomGameStateRef(topicID, gameID, roomID);
    await update(gameStateRef, updates);
  } catch (error) {
    console.error('Error updating game state:', error);
  }
}

/**
 * Advance current player turn
 */
export async function advanceGameTurn(
  topicID: string,
  gameID: string,
  roomID: string,
): Promise<number | null> {
  if (!firebaseDb) return null;

  try {
    const gameStateRef = getRoomGameStateRef(topicID, gameID, roomID);
    const snapshot = await get(gameStateRef);

    if (!snapshot.exists()) return null;

    const gameState = snapshot.val();
    const players = Array.isArray(gameState.players) ? gameState.players : [];

    if (!players.length) return null;

    const nextPlayerIndex = ((gameState.currentPlayerIndex || 0) + 1) % players.length;
    await update(gameStateRef, {currentPlayerIndex: nextPlayerIndex});

    return nextPlayerIndex;
  } catch (error) {
    console.error('Error advancing game turn:', error);
    return null;
  }
}

/**
 * Mark the game finished and store winner metadata
 */
export async function finishGame(
  topicID: string,
  gameID: string,
  roomID: string,
  winner?: {uid: string; displayName: string},
): Promise<void> {
  if (!firebaseDb) return;

  try {
    const gameStateRef = getRoomGameStateRef(topicID, gameID, roomID);
    const payload = {
      gameStatus: 'finished',
      gameWinnerUID: winner?.uid || null,
      gameWinnerDisplayName: winner?.displayName || null,
      finishedAt: new Date().toISOString(),
    };

    await update(gameStateRef, payload);
    await setGameStatus(topicID, gameID, roomID, 'finished');
  } catch (error) {
    console.error('Error finishing game:', error);
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
 * Update Ular Tangga board positions in one call
 */
export async function updatePionPositions(
  topicID: string,
  gameID: string,
  roomID: string,
  pionPositions: number[],
): Promise<void> {
  if (!firebaseDb) return;

  try {
    const gameStateRef = getRoomGameStateRef(topicID, gameID, roomID);
    await update(gameStateRef, {pionPositions});
  } catch (error) {
    console.error('Error updating pion positions:', error);
  }
}

/**
 * Reset a room after a game ends or is abandoned.
 */
export async function resetRoomGameState(
  topicID: string,
  gameID: string,
  roomID: string,
): Promise<void> {
  if (!firebaseDb) return;

  try {
    const roomRef = getRoomRef(topicID, gameID, roomID);
    await update(roomRef, {
      gameStatus: 'waiting',
      currentPlayers: 0,
      gameState: null,
      lastResetAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error resetting room game state:', error);
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
    await resetRoomGameState(topicID, gameID, roomID);
  } catch (error) {
    console.error('Error cleaning up game:', error);
  }
}
