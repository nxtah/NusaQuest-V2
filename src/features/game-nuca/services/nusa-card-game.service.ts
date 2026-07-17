import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { firebaseFirestore } from '@/src/lib/firebase/client';
import { getQuestions as getFsQuestions } from './questions.service';
import { getRegionById } from '@/src/features/destination/services/regions.service';

const GAME_STATES_COLLECTION = 'gameStates';
const ROOMS_COLLECTION = 'rooms';

function requireFirestore() {
  if (!firebaseFirestore) throw new Error('Firestore not configured');
  return firebaseFirestore;
}

function gameStateDocRef(roomID: string) {
  return doc(requireFirestore(), GAME_STATES_COLLECTION, roomID);
}

function roomDocRef(roomID: string) {
  return doc(requireFirestore(), ROOMS_COLLECTION, roomID);
}

export interface NusaCardQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

export interface NusaCardPlayer {
  uid: string;
  displayName: string;
  photoURL?: string;
}

export interface NusaCardGameState {
  players: NusaCardPlayer[];
  playerHands: Record<string, NusaCardQuestion[]>;
  /** Index di `players` — giliran siapa main kartu. */
  throwerIndex: number;
  activeQuestion: NusaCardQuestion | null;
  activeThrowerUID: string | null;
  /** Pemain yang lagi kebagian giliran jawab (selain thrower, sesuai urutan giliran). */
  currentAnsweringUID: string | null;
  /** UID yang masih ngantri jawab soal aktif ini, setelah `currentAnsweringUID`. */
  answeringQueue: string[];
  /** UID yang udah jawab soal aktif ini. */
  answeredUIDs: string[];
  correctCounts: Record<string, number>;
  wrongCounts: Record<string, number>;
  gameStatus: 'playing' | 'finished';
  winnerUID: string | null;
  gameCreatedAt: number;
  lastUpdated: number;
}

/** Fetch real questions for a region, resolving mapId from the regionId. */
export async function getQuestions(topicID: string): Promise<NusaCardQuestion[]> {
  try {
    const region = await getRegionById(topicID);
    if (!region) return [];
    const fsQuestions = await getFsQuestions(region.mapId, topicID, 100);
    return fsQuestions.map((q) => ({
      id: q.questionId,
      text: q.text,
      options: q.options,
      correctIndex: q.correctIndex,
    }));
  } catch (error) {
    console.error('Error fetching NusaCard questions:', error);
    return [];
  }
}

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Deal a shuffled question pool evenly, round-robin, across players. */
function dealHands(players: NusaCardPlayer[], questions: NusaCardQuestion[]): Record<string, NusaCardQuestion[]> {
  const hands: Record<string, NusaCardQuestion[]> = {};
  players.forEach((p) => { hands[p.uid] = []; });
  questions.forEach((q, index) => {
    const player = players[index % players.length];
    hands[player.uid].push(q);
  });
  return hands;
}

export async function initializeNusaCardGameState(
  roomID: string,
  players: NusaCardPlayer[],
  questions: NusaCardQuestion[],
): Promise<void> {
  const correctCounts: Record<string, number> = {};
  const wrongCounts: Record<string, number> = {};
  players.forEach((p) => { correctCounts[p.uid] = 0; wrongCounts[p.uid] = 0; });

  const initialState: NusaCardGameState = {
    players,
    playerHands: dealHands(players, questions),
    throwerIndex: 0,
    activeQuestion: null,
    activeThrowerUID: null,
    currentAnsweringUID: null,
    answeringQueue: [],
    answeredUIDs: [],
    correctCounts,
    wrongCounts,
    gameStatus: 'playing',
    winnerUID: null,
    gameCreatedAt: Date.now(),
    lastUpdated: Date.now(),
  };

  const ref = gameStateDocRef(roomID);
  await setDoc(ref, initialState);
}

export function listenToGameState(
  roomID: string,
  callback: (state: NusaCardGameState | null) => void,
): () => void {
  const ref = gameStateDocRef(roomID);
  return onSnapshot(ref, (snapshot) => {
    callback(snapshot.exists() ? (snapshot.data() as NusaCardGameState) : null);
  });
}

/** Urutan giliran jawab: semua pemain LAIN, mulai dari sesudah thrower, muter. */
function answerOrderAfter(players: NusaCardPlayer[], throwerIndex: number): string[] {
  const order: string[] = [];
  for (let i = 1; i < players.length; i++) {
    order.push(players[(throwerIndex + i) % players.length].uid);
  }
  return order;
}

/** Thrower plays a card from their hand — pemain lain jawab bergiliran sesuai urutan. */
export async function playCard(roomID: string, throwerUID: string, cardId: string): Promise<void> {
  const ref = gameStateDocRef(roomID);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return;
  const state = snapshot.data() as NusaCardGameState;

  if (state.players[state.throwerIndex]?.uid !== throwerUID || state.activeQuestion) return;

  const hand = state.playerHands[throwerUID] ?? [];
  const card = hand.find((c) => c.id === cardId);
  if (!card) return;

  const order = answerOrderAfter(state.players, state.throwerIndex);
  if (order.length === 0) return;

  const nextHand = hand.filter((c) => c.id !== cardId);

  await updateDoc(ref, {
    [`playerHands.${throwerUID}`]: nextHand,
    activeQuestion: card,
    activeThrowerUID: throwerUID,
    currentAnsweringUID: order[0],
    answeringQueue: order.slice(1),
    answeredUIDs: [],
    lastUpdated: Date.now(),
  });
}

/** Pemain yang lagi giliran jawab submit pilihannya; lanjut ke antrean berikutnya. */
export async function submitAnswer(
  roomID: string,
  answeringUID: string,
  selectedIndex: number,
): Promise<{ isCorrect: boolean } | null> {
  const ref = gameStateDocRef(roomID);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  const state = snapshot.data() as NusaCardGameState;

  if (state.currentAnsweringUID !== answeringUID || !state.activeQuestion) return null;

  const isCorrect = selectedIndex === state.activeQuestion.correctIndex;
  const correctCounts = { ...state.correctCounts, [answeringUID]: (state.correctCounts[answeringUID] ?? 0) + (isCorrect ? 1 : 0) };
  const wrongCounts = { ...state.wrongCounts, [answeringUID]: (state.wrongCounts[answeringUID] ?? 0) + (isCorrect ? 0 : 1) };
  const answeredUIDs = [...state.answeredUIDs, answeringUID];

  // Masih ada yang ngantri jawab soal yang sama — lanjut ke antrean berikutnya.
  if (state.answeringQueue.length > 0) {
    const [next, ...rest] = state.answeringQueue;
    await updateDoc(ref, {
      currentAnsweringUID: next,
      answeringQueue: rest,
      answeredUIDs,
      correctCounts,
      wrongCounts,
      lastUpdated: Date.now(),
    });
    return { isCorrect };
  }

  // Semua udah jawab soal ini — giliran main kartu pindah ke pemain berikutnya.
  const nextThrowerIndex = (state.throwerIndex + 1) % state.players.length;
  const handsEmpty = state.players.every((p) => (state.playerHands[p.uid] ?? []).length === 0);

  if (handsEmpty) {
    const winner = state.players.reduce((best, p) =>
      (correctCounts[p.uid] ?? 0) > (correctCounts[best.uid] ?? 0) ? p : best
    , state.players[0]);

    await updateDoc(ref, {
      activeQuestion: null,
      activeThrowerUID: null,
      currentAnsweringUID: null,
      answeringQueue: [],
      answeredUIDs: [],
      correctCounts,
      wrongCounts,
      gameStatus: 'finished',
      winnerUID: winner?.uid ?? null,
      lastUpdated: Date.now(),
    });
  } else {
    await updateDoc(ref, {
      activeQuestion: null,
      activeThrowerUID: null,
      currentAnsweringUID: null,
      answeringQueue: [],
      answeredUIDs: [],
      correctCounts,
      wrongCounts,
      throwerIndex: nextThrowerIndex,
      lastUpdated: Date.now(),
    });
  }

  return { isCorrect };
}

export async function setGameStatus(roomID: string, status: string | null): Promise<void> {
  try {
    await updateDoc(roomDocRef(roomID), { status: status || 'waiting' });
  } catch (error) {
    console.error('Error setting room status:', error);
  }
}

export async function cleanupGame(roomID: string): Promise<void> {
  try {
    await updateDoc(gameStateDocRef(roomID), { gameStatus: 'abandoned', lastUpdated: Date.now() });
  } catch {
    // room may already be gone/cleaned up — nothing to do
  }
}
