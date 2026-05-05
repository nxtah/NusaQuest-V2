/**
 * @file ular-tangga-game.service.ts
 * @description Service layer untuk game Ular Tangga — setara dengan gameDataServices.jsx di V1.
 * Semua data game dibaca dan disimpan ke Firebase Realtime Database.
 * Path database mengikuti konvensi V1: rooms/${topicID}/${gameID}/${roomID}/...
 */

import {
  get,
  onValue,
  set,
  off,
  ref,
} from 'firebase/database';
import { getFirebaseDb } from '../../../lib/firebase/db';

// ─── Helpers untuk path ─────────────────────────────────────────────────────

function roomRef(topicID: string, gameID: string, roomID: string) {
  return `rooms/${topicID}/${gameID}/${roomID}`;
}

function gameStateRef(topicID: string, gameID: string, roomID: string) {
  return `${roomRef(topicID, gameID, roomID)}/gameState`;
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface UlarTanggaQuestion {
  id?: string;
  text: string;
  options: string[];
  correctIndex: number;
  topic?: string;
}

export interface DiceState {
  isRolling: boolean;
  currentNumber: number;
  lastRoll: number | null;
}

export interface PlayerActivity {
  lastActivity: number;
  isActive: boolean;
  playerIndex: number;
}

export interface UlarTanggaGameState {
  currentPlayerIndex: number;
  pionPositions: number[];
  isMoving: boolean;
  showQuestion: boolean;
  waitingForAnswer: boolean;
  isCorrect: boolean | null;
  allowExtraRoll: boolean;
  potionUsable: boolean;
  currentQuestionIndex: number;
  questions: UlarTanggaQuestion[];
  gameStatus: 'playing' | 'finished' | 'abandoned';
  gameType: 'ulartangga';
  diceState: DiceState;
  playerActivity: Record<string, PlayerActivity>;
  gameCreatedAt: number;
  lastUpdated?: number;
  gameWinnerUID?: string;
  gameWinnerDisplayName?: string;
  gameWonAt?: number;
}

export interface GamePlayer {
  uid: string;
  displayName: string;
  name?: string; // alias
  photoURL?: string;
  playerIndex?: number;
  role?: string;
}

// ─── Queue untuk debounce updateGameState ───────────────────────────────────

const updateQueue: Record<string, ReturnType<typeof setTimeout>> = {};

// ─── Fetch Players dari Firebase ─────────────────────────────────────────────

/**
 * Mendengarkan data pemain dalam sebuah ruangan secara real-time.
 * Setara dengan `fetchGamePlayers` di V1.
 */
export function fetchGamePlayers(
  topicID: string,
  gameID: string,
  roomID: string,
  callback: (players: GamePlayer[]) => void,
): () => void {
  if (!topicID || !gameID || !roomID) return () => {};

  const playersRef = ref(
    getFirebaseDb(),
    `${roomRef(topicID, gameID, roomID)}/players`,
  );

  const unsubscribe = onValue(playersRef, (snapshot) => {
    const data = snapshot.val() || {};
    const playersArray = Object.values(data) as GamePlayer[];
    callback(playersArray);
  });

  return () => off(playersRef);
}

// ─── Fetch Questions ─────────────────────────────────────────────────────────

/**
 * Mengambil soal dari Firebase berdasarkan topik.
 * Setara dengan `getQuestions` di V1.
 */
export async function getQuestions(topicID: string): Promise<UlarTanggaQuestion[]> {
  const questionsRef = ref(getFirebaseDb(), 'questions');
  try {
    const snapshot = await get(questionsRef);
    const data = snapshot.val();
    if (!data) return [];

    return Object.keys(data)
      .map((key) => ({ id: key, ...data[key] } as UlarTanggaQuestion))
      .filter((q) => q.topic === topicID);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
}

/**
 * Fisher-Yates shuffle — setara dengan `shuffle` di V1.
 */
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  let currentIndex = arr.length;
  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
  }
  return arr;
}

// ─── Game Status ─────────────────────────────────────────────────────────────

/**
 * Mengatur gameStatus pada room. Setara dengan `setGameStatus` di V1.
 */
export async function setGameStatus(
  topicID: string,
  gameID: string,
  roomID: string,
  status: string | null,
): Promise<void> {
  if (!topicID || !gameID || !roomID) return;
  const statusRef = ref(
    getFirebaseDb(),
    `${roomRef(topicID, gameID, roomID)}/gameStatus`,
  );
  try {
    await set(statusRef, status);
  } catch (error) {
    console.error('Error setting game status:', error);
  }
}

/**
 * Mengatur gameStarted. Setara dengan `setGameStartStatus` di V1.
 */
export async function setGameStartStatus(
  topicID: string,
  gameID: string,
  roomID: string,
  isStarting: boolean,
): Promise<void> {
  if (!topicID || !gameID || !roomID) return;
  const startRef = ref(
    getFirebaseDb(),
    `${roomRef(topicID, gameID, roomID)}/gameStarted`,
  );
  try {
    await set(startRef, isStarting);
  } catch (error) {
    console.error('Error setting game start status:', error);
  }
}

/**
 * Mendengarkan perubahan gameStarted. Setara dengan `listenToGameStart` di V1.
 */
export function listenToGameStart(
  topicID: string,
  gameID: string,
  roomID: string,
  callback: (isStarted: boolean) => void,
): () => void {
  if (!topicID || !gameID || !roomID) return () => {};
  const startRef = ref(
    getFirebaseDb(),
    `${roomRef(topicID, gameID, roomID)}/gameStarted`,
  );
  onValue(startRef, (snapshot) => callback(!!snapshot.val()));
  return () => off(startRef);
}

// ─── Game State ───────────────────────────────────────────────────────────────

/**
 * Mendengarkan gameState secara real-time. Setara dengan `listenToGameState` di V1.
 */
export function listenToGameState(
  topicID: string,
  gameID: string,
  roomID: string,
  callback: (state: UlarTanggaGameState) => void,
): () => void {
  if (!topicID || !gameID || !roomID) return () => {};

  const stateRef = ref(getFirebaseDb(), gameStateRef(topicID, gameID, roomID));
  onValue(stateRef, (snapshot) => {
    const state = snapshot.val();
    if (state) callback(state);
  });

  return () => off(stateRef);
}

/**
 * Mengambil gameState satu kali. Setara dengan `getGameState` di V1.
 */
export async function getGameState(
  topicID: string,
  gameID: string,
  roomID: string,
): Promise<UlarTanggaGameState | null> {
  const stateRef = ref(getFirebaseDb(), gameStateRef(topicID, gameID, roomID));
  try {
    const snapshot = await get(stateRef);
    return snapshot.val();
  } catch (error) {
    console.error('Error getting game state:', error);
    return null;
  }
}

/**
 * Memperbarui gameState dengan debouncing dan deep merge.
 * Setara dengan `updateGameState` di V1.
 */
export function updateGameState(
  topicID: string,
  gameID: string,
  roomID: string,
  updates: Partial<UlarTanggaGameState> & Record<string, unknown>,
): Promise<void> {
  const key = `${topicID}-${gameID}-${roomID}`;

  if (updateQueue[key]) {
    clearTimeout(updateQueue[key]);
  }

  return new Promise((resolve, reject) => {
    updateQueue[key] = setTimeout(async () => {
      try {
        const stateRef = ref(
          getFirebaseDb(),
          gameStateRef(topicID, gameID, roomID),
        );
        const snapshot = await get(stateRef);
        const currentState = (snapshot.val() || {}) as Record<string, unknown>;

        // Deep merge logic dengan support untuk path notation (e.g. "playerActivity/uid/isActive")
        const newState: Record<string, unknown> = { ...currentState };

        const applyUpdates = (
          target: Record<string, unknown>,
          source: Record<string, unknown>,
        ) => {
          for (const key in source) {
            if (key.includes('/')) {
              const parts = key.split('/');
              let cur = target;
              for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (i === parts.length - 1) {
                  cur[part] = source[key];
                } else {
                  if (!cur[part] || typeof cur[part] !== 'object') {
                    cur[part] = {};
                  }
                  cur = cur[part] as Record<string, unknown>;
                }
              }
            } else if (
              typeof source[key] === 'object' &&
              source[key] !== null &&
              !Array.isArray(source[key]) &&
              typeof target[key] === 'object' &&
              target[key] !== null
            ) {
              target[key] = {
                ...(target[key] as Record<string, unknown>),
                ...(source[key] as Record<string, unknown>),
              };
            } else {
              target[key] = source[key];
            }
          }
        };

        applyUpdates(newState, updates as Record<string, unknown>);
        newState.lastUpdated = Date.now();

        // Hapus undefined
        const cleanState = Object.fromEntries(
          Object.entries(newState).filter(([, v]) => v !== undefined),
        );

        await set(stateRef, cleanState);
        delete updateQueue[key];
        resolve();
      } catch (error) {
        console.error('Error updating game state:', error);
        delete updateQueue[key];
        reject(error);
      }
    }, 0);
  });
}

// ─── Initialize ───────────────────────────────────────────────────────────────

/**
 * Menginisialisasi gameState Ular Tangga jika belum ada.
 * Setara dengan `initializeUlarTanggaGameState` di V1.
 */
export async function initializeUlarTanggaGameState(
  topicID: string,
  gameID: string,
  roomID: string,
  players: GamePlayer[],
  questions: UlarTanggaQuestion[],
): Promise<void> {
  const stateRef = ref(getFirebaseDb(), gameStateRef(topicID, gameID, roomID));
  try {
    const snapshot = await get(stateRef);
    if (!snapshot.exists()) {
      const playerCount = players.length;

      const initialState: UlarTanggaGameState = {
        currentPlayerIndex: 0,
        pionPositions: new Array(playerCount).fill(0),
        isMoving: false,
        showQuestion: false,
        waitingForAnswer: false,
        isCorrect: null,
        allowExtraRoll: false,
        potionUsable: false,
        currentQuestionIndex: 0,
        questions,
        gameStatus: 'playing',
        gameType: 'ulartangga',
        diceState: {
          isRolling: false,
          currentNumber: 1,
          lastRoll: null,
        },
        playerActivity: players.reduce(
          (acc, player, index) => {
            acc[player.uid] = {
              lastActivity: Date.now(),
              isActive: true,
              playerIndex: index,
            };
            return acc;
          },
          {} as Record<string, PlayerActivity>,
        ),
        gameCreatedAt: Date.now(),
      };

      await set(stateRef, initialState);
    }
  } catch (error) {
    console.error('Error initializing Ular Tangga game state:', error);
    throw error;
  }
}

// ─── Cleanup ─────────────────────────────────────────────────────────────────

/**
 * Membersihkan semua data game dari Firebase.
 * Setara dengan `cleanupGame` di V1.
 */
export async function cleanupGame(
  topicID: string,
  gameID: string,
  roomID: string,
): Promise<void> {
  const db = getFirebaseDb();
  try {
    await set(ref(db, gameStateRef(topicID, gameID, roomID)), null);
    await set(ref(db, `${roomRef(topicID, gameID, roomID)}/gameTimer`), null);
    await setGameStatus(topicID, gameID, roomID, null);
    await setGameStartStatus(topicID, gameID, roomID, false);
    await set(ref(db, `${roomRef(topicID, gameID, roomID)}/chatMessages`), null);
    await set(ref(db, `${roomRef(topicID, gameID, roomID)}/players`), null);
  } catch (error) {
    console.error('Error cleaning up game:', error);
  }
}

// ─── Player Activity ─────────────────────────────────────────────────────────

/**
 * Update lastActivity seorang pemain. Setara dengan `updatePlayerActivity` di V1.
 */
export async function updatePlayerActivity(
  topicID: string,
  gameID: string,
  roomID: string,
  userUID: string,
): Promise<void> {
  if (!topicID || !gameID || !roomID || !userUID) return;
  const activityRef = ref(
    getFirebaseDb(),
    `${gameStateRef(topicID, gameID, roomID)}/playerActivity/${userUID}`,
  );
  try {
    const snapshot = await get(activityRef);
    if (snapshot.exists()) {
      await set(activityRef, {
        ...snapshot.val(),
        lastActivity: Date.now(),
        isActive: true,
      });
    }
  } catch (error) {
    console.error('Error updating player activity:', error);
  }
}
