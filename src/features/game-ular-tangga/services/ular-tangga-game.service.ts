import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { firebaseFirestore } from '@/src/lib/firebase/client';
import { getQuestionsByRegion } from '@/src/features/game-nuca/services/questions.service';
import { getRegionById } from '@/src/features/destination/services/regions.service';
import {
  isLadderStart,
  getLadderTarget,
  isSnakeHead,
  getSnakeTail,
} from '../utils/board-rules';

const GAME_STATES_COLLECTION = 'gameStates';
const ROOMS_COLLECTION = 'rooms';
// Idle GLOBAL (bukan per-pemain, beda dari staleness playerActivity di
// bawah) — kalau gak ada aksi nyata (lempar dadu/jawab soal) dari SIAPAPUN
// selama ini, game dianggap invalid & di-reset. Sama persis konsepnya
// dengan versi NusaCard (nusa-card-game.service.ts).
const GLOBAL_IDLE_MS = 8 * 60_000;
// Batas waktu buat jawab soal — telat dianggap salah otomatis (lewat jalur
// submitAnswer yang sama persis kayak salah jawab manual), bukan tebakan
// acak. Diekspor biar client bisa pakai angka yang sama buat hitung mundur.
export const ANSWER_TIMEOUT_MS = 8_000;

function requireFirestore() {
  if (!firebaseFirestore) throw new Error('Firestore not configured');
  return firebaseFirestore;
}

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
  rollingPlayerId?: string;
}

export interface PlayerActivity {
  lastActivity: number;
  isActive: boolean;
  playerIndex: number;
}

export interface UlarTanggaGameState {
  currentPlayerIndex: number;
  currentPlayerUID?: string;
  lastTurnChangeAt?: number;
  playerUIDs: string[];
  pionPositions: number[];
  isMoving: boolean;
  showQuestion: boolean;
  waitingForAnswer: boolean;
  isCorrect: boolean | null;
  selectedAnswerIndex: number | null;
  allowExtraRoll: boolean;
  potionUsable: boolean;
  currentQuestionIndex: number;
  /** Kapan soal SEKARANG dimunculin — dasar hitung mundur 8 detik buat
      jawab. Cuma valid selagi `waitingForAnswer` true. */
  questionShownAt?: number | null;
  turnCounter: number;
  questions: UlarTanggaQuestion[];
  gameStatus: 'playing' | 'finished' | 'abandoned' | 'timeout';
  gameType: 'ulartangga';
  diceState: DiceState;
  playerActivity: Record<string, PlayerActivity>;
  gameCreatedAt: number;
  lastUpdated?: number;
  /** Kapan terakhir kali ADA aksi nyata (lempar dadu/jawab soal) — dasar cek idle global, beda dari `lastUpdated` yang juga ke-bump sama heartbeat. */
  lastActionAt?: number;
  gameWinnerUID?: string;
  gameWinnerDisplayName?: string;
  gameWonAt?: number;
  /** UID yang udah nge-claim reward (badge/potion) buat game ini — guard
      biar gak ke-double-grant kalau client reconnect/buka ulang WinModal. */
  rewardsClaimedBy?: string[];
  /** UID yang statistiknya (win-streak/achievement) udah ke-proses buat
      game ini — guard terpisah dari `rewardsClaimedBy` karena ini jalan
      buat SEMUA pemain (menang atau kalah), bukan cuma pemenang. */
  statsRecordedBy?: string[];
}

export interface GamePlayer {
  uid: string;
  displayName: string;
  name?: string;
  photoURL?: string;
  playerIndex?: number;
  role?: string;
}

function gameStateDocRef(roomID: string) {
  return doc(requireFirestore(), GAME_STATES_COLLECTION, roomID);
}

function roomDocRef(roomID: string) {
  return doc(requireFirestore(), ROOMS_COLLECTION, roomID);
}

// Dipanggil proaktif begitu game beneran selesai (menang normal ATAU
// sole-survivor) — biar room langsung kebuka lagi buat orang lain, bukan
// nunggu ada yang KEBETULAN visit ulang halaman room dan mentrigger
// checkAndResetAbandonedRoom.
async function reopenRoom(roomID: string): Promise<void> {
  try {
    const roomRef = roomDocRef(roomID);
    const updates: Record<string, unknown> = { status: 'waiting', gameStarted: false };
    // Ikut bersihin `players.{uid}.isActive` semua penghuni lama — kalau
    // enggak, badge okupansi lobby (RoomSelect.tsx, baca field ini) masih
    // nampilin "N orang" di room yang udah beneran kosong/reopened, karena
    // field ini cuma ke-update pas pemain LEAVE, bukan pas game/room-nya
    // yang di-reset. Room yang "dibuka lagi" harusnya keliatan bener-bener
    // kosong buat siapapun yang mau join baru.
    const roomSnap = await getDoc(roomRef);
    const players = roomSnap.exists() ? (roomSnap.data().players as Record<string, unknown> | undefined) : undefined;
    if (players) {
      for (const uid of Object.keys(players)) {
        updates[`players.${uid}.isActive`] = false;
      }
    }
    await updateDoc(roomRef, updates);
  } catch (error) {
    console.error('Error reopening room:', error);
  }
}

export async function updateGameState(
  topicID: string,
  gameID: string,
  roomID: string,
  updates: Partial<UlarTanggaGameState> & Record<string, unknown>,
): Promise<void> {
  if (!topicID || !gameID || !roomID) return;
  try {
    const ref = gameStateDocRef(roomID);
    const current = await getDoc(ref);
    if (!current.exists()) {
      const base: UlarTanggaGameState = {
        currentPlayerIndex: 0,
        playerUIDs: [],
        pionPositions: [],
        isMoving: false,
        showQuestion: false,
        waitingForAnswer: false,
        isCorrect: null,
        selectedAnswerIndex: null,
        allowExtraRoll: false,
        potionUsable: false,
        currentQuestionIndex: 0,
        turnCounter: 0,
        questions: [],
        gameStatus: 'playing',
        gameType: 'ulartangga',
        diceState: { isRolling: false, currentNumber: 0, lastRoll: null },
        playerActivity: {},
        gameCreatedAt: Date.now(),
        ...updates,
      } as unknown as UlarTanggaGameState;
      await setDoc(ref, { ...base, ...updates, lastUpdated: Date.now() });
    } else {
      await updateDoc(ref, { ...updates, lastUpdated: Date.now() });
    }
  } catch (error) {
    console.error('Error updating game state:', error);
    throw error;
  }
}

export function fetchGamePlayers(
  topicID: string,
  gameID: string,
  roomID: string,
  callback: (players: GamePlayer[]) => void,
): () => void {
  const ref = roomDocRef(roomID);
  return onSnapshot(ref, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const data = snapshot.data();
    const playersData = data.players || {};
    const playersArray: GamePlayer[] = Object.entries(playersData).map(
      ([uid, p], index) => {
        const player = p as Record<string, unknown>;
        return {
          uid,
          displayName: (player.displayName as string) || (player.name as string) || 'Pemain',
          photoURL: player.photoURL as string | undefined,
          playerIndex: index,
          role: player.role as string | undefined,
        };
      },
    );
    callback(playersArray);
  });
}

// Param sebenarnya regionId (lihat CLAUDE.md: "topicID" di seluruh route
// itu regionId, bukan mapId) — resolve ke mapId dulu via region, baru query
// biar soal ke-filter sesuai topik/provinsi room, sama pola dengan
// game-nuca/services/nusa-card-game.service.ts.
export async function getQuestions(regionId: string): Promise<UlarTanggaQuestion[]> {
  try {
    const region = await getRegionById(regionId);
    if (!region) return [];
    const fsQuestions = await getQuestionsByRegion(region.mapId, regionId, 100);
    return fsQuestions.map((q) => ({
      id: q.questionId,
      text: q.text,
      options: q.options,
      correctIndex: q.correctIndex,
      topic: q.regionId,
    }));
  } catch {
    return [];
  }
}

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

export async function setGameStatus(
  topicID: string,
  gameID: string,
  roomID: string,
  status: string | null,
): Promise<void> {
  if (!topicID || !gameID || !roomID) return;
  try {
    const ref = roomDocRef(roomID);
    await updateDoc(ref, { status: status || 'waiting' });
  } catch (error) {
    console.error('Error setting game status:', error);
  }
}

export async function setGameStartStatus(
  topicID: string,
  gameID: string,
  roomID: string,
  isStarting: boolean,
): Promise<void> {
  if (!topicID || !gameID || !roomID) return;
  try {
    const ref = roomDocRef(roomID);
    await updateDoc(ref, { gameStarted: isStarting });
  } catch (error) {
    console.error('Error setting game start status:', error);
  }
}

export function listenToGameStart(
  topicID: string,
  gameID: string,
  roomID: string,
  callback: (gameStarted: boolean) => void,
): () => void {
  const ref = roomDocRef(roomID);
  return onSnapshot(ref, (snapshot) => {
    if (!snapshot.exists()) {
      callback(false);
      return;
    }
    const data = snapshot.data();
    callback(data.status === 'playing' || data.gameStarted === true);
  });
}

export function listenToGameState(
  topicID: string,
  gameID: string,
  roomID: string,
  callback: (state: UlarTanggaGameState | null) => void,
): () => void {
  const ref = gameStateDocRef(roomID);
  return onSnapshot(ref, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    callback(snapshot.data() as UlarTanggaGameState);
  });
}

export async function initializeUlarTanggaGameState(
  topicID: string,
  gameID: string,
  roomID: string,
  players: GamePlayer[],
  questions: UlarTanggaQuestion[],
): Promise<void> {
  const initialState: UlarTanggaGameState = {
    currentPlayerIndex: 0,
    currentPlayerUID: players[0]?.uid,
    lastTurnChangeAt: Date.now(),
    playerUIDs: players.map((p) => p.uid),
    pionPositions: players.map(() => 0),
    isMoving: false,
    showQuestion: false,
    waitingForAnswer: false,
    isCorrect: null,
    selectedAnswerIndex: null,
    allowExtraRoll: false,
    potionUsable: false,
    currentQuestionIndex: 0,
    turnCounter: 0,
    questions,
    gameStatus: 'playing',
    gameType: 'ulartangga',
    diceState: { isRolling: false, currentNumber: 0, lastRoll: null },
    playerActivity: {},
    gameCreatedAt: Date.now(),
    lastUpdated: Date.now(),
    lastActionAt: Date.now(),
  };

  try {
    const ref = gameStateDocRef(roomID);
    await setDoc(ref, initialState);
  } catch (error) {
    console.error('Error initializing game state:', error);
  }
}

export async function cleanupGame(
  topicID: string,
  gameID: string,
  roomID: string,
): Promise<void> {
  try {
    const ref = gameStateDocRef(roomID);
    await updateDoc(ref, {
      gameStatus: 'abandoned',
      lastUpdated: Date.now(),
    });
  } catch {
    // gameState may not exist — not fatal
  }
}

/**
 * Cek apakah sesi game sebelumnya sudah selesai/ditinggal. Jika ya, reset
 * dokumen room ke status 'waiting' agar room page tidak langsung redirect
 * ke halaman game saat user kembali ke room yang sama.
 */
export async function checkAndResetAbandonedRoom(
  roomID: string,
): Promise<void> {
  try {
    const roomRef = roomDocRef(roomID);
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) return;

    const roomData = roomSnap.data();
    if (roomData.status !== 'playing') return;

    const gsRef = gameStateDocRef(roomID);
    const gsSnap = await getDoc(gsRef);

    let shouldReset = !gsSnap.exists();

    if (!shouldReset && gsSnap.exists()) {
      const gs = gsSnap.data() as { gameStatus?: string; playerActivity?: Record<string, PlayerActivity> };
      if (gs.gameStatus === 'finished' || gs.gameStatus === 'abandoned') {
        shouldReset = true;
      } else {
        const activity = gs.playerActivity ?? {};
        const keys = Object.keys(activity);
        const anyOnline = keys.length > 0 && Object.values(activity).some((a) => a.isActive);
        if (!anyOnline && keys.length > 0) shouldReset = true;
      }
    }

    if (shouldReset) {
      // Pake reopenRoom (bukan updateDoc manual) — biar `players.{uid}
      // .isActive` ikut kebersihin juga, bukan cuma `status`/`gameStarted`.
      await reopenRoom(roomID);
    }
  } catch (error) {
    console.error('Error checking/resetting abandoned room:', error);
  }
}

/**
 * Dipanggil dari client pemain yang masih aktif — kalau ternyata dia satu-
 * satunya yang tersisa (lawan keluar tab/nutup browser), otomatis
 * dimenangkan. Threshold staleness (60s, "belum ada activity record = masih
 * dianggap aktif") sengaja disamain persis sama formula bot-takeover di
 * halaman play, biar konsisten definisi "aktif" di seluruh game ini.
 * Idempotent lewat guard gameStatus!=='playing' — aman dipanggil berkali-
 * kali dari effect yang re-fire tiap gameState berubah.
 */
export async function checkAndFinalizeSoleSurvivor(
  topicID: string,
  gameID: string,
  roomID: string,
): Promise<void> {
  try {
    const ref = gameStateDocRef(roomID);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return;

    const state = snapshot.data() as UlarTanggaGameState;
    if (state.gameStatus !== 'playing') return;
    if (!state.playerUIDs || state.playerUIDs.length < 2) return;

    const ts = Date.now();
    const activeUIDs = state.playerUIDs.filter((uid) => {
      const act = state.playerActivity?.[uid];
      return act ? (act.isActive && ts - act.lastActivity <= 60000) : true;
    });
    if (activeUIDs.length !== 1) return;

    const winnerUID = activeUIDs[0];
    await updateDoc(ref, {
      gameStatus: 'finished',
      gameWinnerUID: winnerUID,
      gameWonAt: ts,
      lastUpdated: ts,
    });
    await reopenRoom(roomID);
  } catch (error) {
    console.error('Error finalizing sole-survivor win:', error);
  }
}

/**
 * Cek idle GLOBAL (bukan per-pemain) — kalau gak ada aksi nyata dari
 * siapapun selama GLOBAL_IDLE_MS, game & room di-invalidate. Aman dipanggil
 * berkali-kali dari client manapun (idempotent lewat guard gameStatus).
 */
export async function checkAndInvalidateIfIdle(roomID: string): Promise<void> {
  try {
    const ref = gameStateDocRef(roomID);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return;
    const state = snapshot.data() as UlarTanggaGameState;
    if (state.gameStatus !== 'playing') return;

    const lastAction = state.lastActionAt ?? state.gameCreatedAt;
    if (Date.now() - lastAction <= GLOBAL_IDLE_MS) return;

    await updateDoc(ref, { gameStatus: 'timeout', lastUpdated: Date.now() });
    await reopenRoom(roomID);
  } catch (error) {
    console.error('Error checking/invalidating idle Ular Tangga game:', error);
  }
}

export function updatePlayerActivity(
  topicID: string,
  gameID: string,
  roomID: string,
  playerId: string,
  activity?: Partial<PlayerActivity>,
): Promise<void> {
  return updateGameState(topicID, gameID, roomID, {
    [`playerActivity.${playerId}`]: {
      lastActivity: Date.now(),
      isActive: true,
      playerIndex: activity?.playerIndex ?? 0,
      ...(activity ?? {}),
    },
  } as unknown as Partial<UlarTanggaGameState>);
}

export async function setPlayerOffline(
  topicID: string,
  gameID: string,
  roomID: string,
  playerId: string,
): Promise<void> {
  try {
    const ref = gameStateDocRef(roomID);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return;
    const state = snapshot.data() as UlarTanggaGameState;
    if (state.playerActivity?.[playerId]) {
      state.playerActivity[playerId].isActive = false;
      await updateDoc(ref, { playerActivity: state.playerActivity });
    }
  } catch (error) {
    console.error('Error setting player offline:', error);
  }
}

export async function movePawn(
  topicID: string,
  gameID: string,
  roomID: string,
  playerIndex: number,
  steps: number,
): Promise<number> {
  const ref = gameStateDocRef(roomID);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) throw new Error('Game state not found');

  const state = snapshot.data() as UlarTanggaGameState;
  const positions = [...state.pionPositions];
  const currentPosition = positions[playerIndex];
  const newPosition = currentPosition + steps;
  const rollsSix = steps === 6;

  // Harus pas sampai kotak 100 — kalau lebih, pion diam di tempat, giliran tetap habis
  // (kecuali dadu 6, lihat allowExtraRoll di nextTurn).
  if (newPosition > 100) {
    await updateDoc(ref, {
      isMoving: false,
      allowExtraRoll: rollsSix,
      lastUpdated: Date.now(),
      lastActionAt: Date.now(),
    });
    return currentPosition;
  }

  positions[playerIndex] = newPosition;

  // Menang: pion sampai pas kotak 100.
  if (newPosition === 100) {
    await updateDoc(ref, {
      pionPositions: positions,
      isMoving: false,
      gameStatus: 'finished',
      gameWinnerUID: state.playerUIDs[playerIndex],
      gameWonAt: Date.now(),
      lastUpdated: Date.now(),
      lastActionAt: Date.now(),
    });
    await reopenRoom(roomID);
    return newPosition;
  }

  // Landing di kepala ular: tulis dulu posisi di kepala (biar animasi jalan
  // kotak-per-kotak kelihatan di client), tunggu animasi jalan selesai,
  // baru turun ke ekor lewat update terpisah (biar meluncur, bukan jalan).
  if (isSnakeHead(newPosition)) {
    await updateDoc(ref, {
      pionPositions: positions,
      isMoving: true,
      lastUpdated: Date.now(),
      lastActionAt: Date.now(),
    });

    const walkDurationMs = steps * 320 + 300;
    await new Promise((resolve) => setTimeout(resolve, walkDurationMs));

    // Baca ulang posisi TERBARU sebelum nulis balik — `positions` di atas
    // adalah snapshot dari SEBELUM delay ini. Kalau ada write lain yang
    // landing selama nunggu (mis. pemain lain jalan), nulis balik array
    // basi bakal nimpa perubahan itu (lost update). Cukup patch index
    // pemain ini di atas array yang paling baru.
    const latestSnapshot = await getDoc(ref);
    const latestPositions = latestSnapshot.exists()
      ? [...(latestSnapshot.data() as UlarTanggaGameState).pionPositions]
      : positions;
    const tail = getSnakeTail(newPosition)!;
    latestPositions[playerIndex] = tail;
    await updateDoc(ref, {
      pionPositions: latestPositions,
      isMoving: false,
      allowExtraRoll: rollsSix,
      lastUpdated: Date.now(),
      lastActionAt: Date.now(),
    });
    return tail;
  }

  // Landing di pangkal tangga: munculin soal dulu, tangga baru naik kalau jawaban benar
  // (lihat submitAnswer). Tanpa soal tersedia, langsung lanjut kayak kotak biasa.
  if (isLadderStart(newPosition) && state.questions.length > 0) {
    const questionIndex = Math.floor(Math.random() * state.questions.length);
    await updateDoc(ref, {
      pionPositions: positions,
      isMoving: false,
      showQuestion: true,
      waitingForAnswer: true,
      currentQuestionIndex: questionIndex,
      questionShownAt: Date.now(),
      allowExtraRoll: rollsSix,
      lastUpdated: Date.now(),
      lastActionAt: Date.now(),
    });
    return newPosition;
  }

  await updateDoc(ref, {
    pionPositions: positions,
    isMoving: false,
    allowExtraRoll: rollsSix,
    lastUpdated: Date.now(),
    lastActionAt: Date.now(),
  });

  return newPosition;
}

export async function submitAnswer(
  topicID: string,
  gameID: string,
  roomID: string,
  selectedIndex: number,
): Promise<boolean> {
  const ref = gameStateDocRef(roomID);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return false;

  const state = snapshot.data() as UlarTanggaGameState;
  const currentQuestion = state.questions[state.currentQuestionIndex];
  if (!currentQuestion) return false;

  const isCorrect = selectedIndex === currentQuestion.correctIndex;
  const positions = [...state.pionPositions];
  const actorIndex = state.currentPlayerIndex;

  // Jawaban benar di pangkal tangga: naik ke ujung tangga.
  if (isCorrect) {
    const target = getLadderTarget(positions[actorIndex]);
    if (target) positions[actorIndex] = target;
  }

  const updates: Record<string, unknown> = {
    isCorrect,
    selectedAnswerIndex: selectedIndex,
    waitingForAnswer: false,
    // showQuestion TETAP true di sini — biar QuestionPanel gak langsung
    // ganti ke InitialPanel dan highlight merah/hijau jawaban sempet
    // kelihatan. nextTurn() yang reset showQuestion:false setelah delay.
    pionPositions: positions,
    lastUpdated: Date.now(),
    lastActionAt: Date.now(),
  };

  const isWin = isCorrect && positions[actorIndex] >= 100;
  if (isWin) {
    updates.gameStatus = 'finished';
    updates.gameWinnerUID = state.playerUIDs[actorIndex];
    updates.gameWonAt = Date.now();
  }

  await updateDoc(ref, updates);
  if (isWin) await reopenRoom(roomID);

  return isCorrect;
}

export async function nextTurn(
  topicID: string,
  gameID: string,
  roomID: string,
): Promise<void> {
  const ref = gameStateDocRef(roomID);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return;

  const state = snapshot.data() as UlarTanggaGameState;
  const playerCount = state.pionPositions.length;

  // Dadu 6: pemain yang sama lempar lagi, giliran (index/UID) gak pindah.
  // turnCounter TETAP dinaikin di sini juga — dipakai halaman play sebagai
  // sinyal "ronde lempar baru dimulai" buat reset guard anti-double-roll bot
  // (lastBotTurnRef). Kalau gak dinaikin, bot yang dapet extra roll gak akan
  // pernah lempar lagi karena guard-nya gak pernah ke-reset.
  if (state.allowExtraRoll) {
    await updateDoc(ref, {
      lastTurnChangeAt: Date.now(),
      turnCounter: (state.turnCounter ?? 0) + 1,
      diceState: { isRolling: false, currentNumber: 0, lastRoll: null },
      waitingForAnswer: false,
      showQuestion: false,
      isCorrect: null,
      selectedAnswerIndex: null,
      allowExtraRoll: false,
      currentQuestionIndex: 0,
      questionShownAt: null,
      lastUpdated: Date.now(),
      lastActionAt: Date.now(),
    });
    return;
  }

  const nextIndex = (state.currentPlayerIndex + 1) % playerCount;
  const nextUID = state.playerUIDs?.[nextIndex];

  await updateDoc(ref, {
    currentPlayerIndex: nextIndex,
    currentPlayerUID: nextUID ?? null,
    lastTurnChangeAt: Date.now(),
    turnCounter: (state.turnCounter ?? 0) + 1,
    diceState: { isRolling: false, currentNumber: 0, lastRoll: null },
    waitingForAnswer: false,
    showQuestion: false,
    isCorrect: null,
    selectedAnswerIndex: null,
    allowExtraRoll: false,
    currentQuestionIndex: 0,
    questionShownAt: null,
    lastUpdated: Date.now(),
    lastActionAt: Date.now(),
  });
}
