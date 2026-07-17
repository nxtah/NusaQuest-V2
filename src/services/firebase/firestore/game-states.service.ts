import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  type UpdateData,
} from 'firebase/firestore';
import { firebaseFirestore } from '@/src/lib/firebase/client';
import type { GameState, PlayerGameState } from '@/src/types/firestore';

const GAME_STATES_COLLECTION = 'gameStates';

function requireFirestore() {
  if (!firebaseFirestore) throw new Error('Firestore not configured');
  return firebaseFirestore;
}

export async function createGameState(roomId: string, playerIds: string[]): Promise<GameState> {
  const db = requireFirestore();
  const playerStates: Record<string, PlayerGameState> = {};
  for (const uid of playerIds) {
    playerStates[uid] = {
      score: 0,
      position: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      isWaiting: false,
      lastAction: Date.now(),
    };
  }

  const gameState: GameState = {
    roomId,
    currentPlayerIndex: 0,
    round: 0,
    turnStartedAt: Date.now(),
    playerStates,
    questionsUsed: [],
    winner: undefined,
    updatedAt: Date.now(),
  };

  const ref = doc(db, GAME_STATES_COLLECTION, roomId);
  await setDoc(ref, gameState);
  return gameState;
}

export async function getGameState(roomId: string): Promise<GameState | null> {
  const db = requireFirestore();
  const snapshot = await getDoc(doc(db, GAME_STATES_COLLECTION, roomId));
  if (!snapshot.exists()) return null;
  return snapshot.data() as GameState;
}

export async function updateGameState(
  roomId: string,
  updates: Partial<GameState>,
): Promise<void> {
  const db = requireFirestore();
  const ref = doc(db, GAME_STATES_COLLECTION, roomId);
  await updateDoc(ref, {
    ...updates,
    updatedAt: Date.now(),
  } as UpdateData<GameState>);
}

export function subscribeToGameState(
  roomId: string,
  callback: (state: GameState | null) => void,
): () => void {
  const db = requireFirestore();
  const ref = doc(db, GAME_STATES_COLLECTION, roomId);
  return onSnapshot(ref, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
    } else {
      callback(snapshot.data() as GameState);
    }
  });
}

export async function advanceTurn(roomId: string, playerCount: number): Promise<number> {
  const state = await getGameState(roomId);
  if (!state) throw new Error('Game state not found');
  const nextIndex = (state.currentPlayerIndex + 1) % playerCount;
  await updateGameState(roomId, {
    currentPlayerIndex: nextIndex,
    turnStartedAt: Date.now(),
  });
  return nextIndex;
}
