import { doc, updateDoc } from 'firebase/firestore';
import { firebaseFirestore } from '@/src/lib/firebase/client';
import { getQuestions as getFsQuestions } from '@/src/features/game-nuca/services/questions.service';
import { getRegionById } from '@/src/features/destination/services/regions.service';
import {
  createGameState,
  getGameState,
  updateGameState as updateFsGameState,
  subscribeToGameState as subscribeFsGameState,
  advanceTurn,
} from '@/src/services/firebase/firestore/game-states.service';
import type { GameState } from '@/src/types/firestore';

const ROOMS_COLLECTION = 'rooms';

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

function requireFirestore() {
  if (!firebaseFirestore) throw new Error('Firestore not configured');
  return firebaseFirestore;
}

export async function getQuestions(topicID: string): Promise<GameQuestion[]> {
  const region = await getRegionById(topicID);
  if (!region) return [];
  const questions = await getFsQuestions(region.mapId, topicID, 100);
  return questions.map((q) => ({
    id: q.questionId,
    question: q.text,
    options: q.options,
    correctAnswer: q.correctIndex,
    topic: q.regionId,
  }));
}

export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function initializeNusaCardGameState(
  topicID: string,
  gameID: string,
  roomID: string,
  players: GamePlayer[],
  questions: GameQuestion[],
): Promise<void> {
  const playerIds = players.map((p) => p.uid);
  await createGameState(roomID, playerIds);
}

export async function initializeUlarTanggaGameState(
  topicID: string,
  gameID: string,
  roomID: string,
  players: GamePlayer[],
  questions: GameQuestion[],
): Promise<void> {
  const playerIds = players.map((p) => p.uid);
  await createGameState(roomID, playerIds);
  const gs = await getGameState(roomID);
  if (gs) {
    for (const uid of playerIds) {
      if (gs.playerStates[uid]) {
        gs.playerStates[uid].position = 0;
      }
    }
    await updateFsGameState(roomID, {
      playerStates: gs.playerStates,
      updatedAt: Date.now(),
    });
  }
}

export function subscribeToTypedGameState<TGameState extends BaseGameState>(
  topicID: string,
  gameID: string,
  roomID: string,
  callback: (gameState: TGameState | null) => void,
): () => void {
  return subscribeFsGameState(roomID, (state) => {
    if (!state) {
      callback(null);
      return;
    }
    callback(state as unknown as TGameState);
  });
}

export function subscribeToGameState(
  topicID: string,
  gameID: string,
  roomID: string,
  callback: (gameState: BaseGameState | null) => void,
): () => void {
  return subscribeToTypedGameState<BaseGameState>(topicID, gameID, roomID, callback);
}

export async function updateGameState(
  topicID: string,
  gameID: string,
  roomID: string,
  updates: Partial<BaseGameState> & Record<string, unknown>,
): Promise<void> {
  await updateFsGameState(roomID, updates as Partial<GameState>);
}

export async function advanceGameTurn(
  topicID: string,
  gameID: string,
  roomID: string,
): Promise<number | null> {
  try {
    const gs = await getGameState(roomID);
    if (!gs) return null;
    const playerCount = Object.keys(gs.playerStates).length;
    return await advanceTurn(roomID, playerCount);
  } catch {
    return null;
  }
}

export async function finishGame(
  topicID: string,
  gameID: string,
  roomID: string,
  winner?: { uid: string; displayName: string },
): Promise<void> {
  await updateFsGameState(roomID, {
    winner: winner?.uid,
    updatedAt: Date.now(),
  } as Partial<GameState>);
  await setGameStatus(topicID, gameID, roomID, 'finished');
}

export async function setGameStatus(
  topicID: string,
  gameID: string,
  roomID: string,
  status: 'playing' | 'finished',
): Promise<void> {
  const db = requireFirestore();
  const roomRef = doc(db, ROOMS_COLLECTION, roomID);
  await updateDoc(roomRef, {
    status: status,
    ...(status === 'finished' ? { finishedAt: Date.now() } : { startedAt: Date.now() }),
  });
}

export async function updatePionPositions(
  topicID: string,
  gameID: string,
  roomID: string,
  pionPositions: number[],
): Promise<void> {
  const gs = await getGameState(roomID);
  if (!gs) return;
  const uids = Object.keys(gs.playerStates);
  for (let i = 0; i < Math.min(uids.length, pionPositions.length); i++) {
    gs.playerStates[uids[i]].position = pionPositions[i];
  }
  await updateFsGameState(roomID, { playerStates: gs.playerStates });
}

export async function resetRoomGameState(
  topicID: string,
  gameID: string,
  roomID: string,
): Promise<void> {
  const db = requireFirestore();
  const roomRef = doc(db, ROOMS_COLLECTION, roomID);
  await updateDoc(roomRef, {
    status: 'waiting',
  });
}

export async function cleanupGame(
  topicID: string,
  gameID: string,
  roomID: string,
): Promise<void> {
  await resetRoomGameState(topicID, gameID, roomID);
}
