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
  update,
  remove,
  off,
  ref,
} from 'firebase/database';
import { getFirebaseDb } from '../../../lib/firebase/db';
import {
  isLadderStart,
  getLadderTarget,
  isSnakeHead,
  getSnakeTarget,
} from '../utils/board-rules';

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
  selectedAnswerIndex: number | null;
  allowExtraRoll: boolean;
  potionUsable: boolean;
  currentQuestionIndex: number;
  turnCounter?: number;
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

/**
 * Memperbarui gameState secara atomik menggunakan Firebase update().
 * Tidak perlu GET+SET — lebih aman dari race condition.
 * Setara dengan `updateGameState` di V1.
 */
export async function updateGameState(
  topicID: string,
  gameID: string,
  roomID: string,
  updates: Partial<UlarTanggaGameState> & Record<string, unknown>,
): Promise<void> {
  if (!topicID || !gameID || !roomID) return;

  try {
    const basePath = gameStateRef(topicID, gameID, roomID);
    const db = getFirebaseDb();

    // Flatten nested objects ke format Firebase update path
    // Contoh: { diceState: { isRolling: false } } → { 'diceState/isRolling': false }
    const flatUpdates: Record<string, unknown> = {};

    const flatten = (obj: Record<string, unknown>, prefix = '') => {
      for (const key in obj) {
        const val = obj[key];
        const fullKey = prefix ? `${prefix}/${key}` : key;
        if (
          val !== null &&
          typeof val === 'object' &&
          !Array.isArray(val)
        ) {
          flatten(val as Record<string, unknown>, fullKey);
        } else {
          flatUpdates[`${basePath}/${fullKey}`] = val;
        }
      }
    };

    // Array harus disimpan utuh (tidak di-flatten)
    const topLevelUpdates: Record<string, unknown> = {};
    for (const key in updates) {
      const val = (updates as Record<string, unknown>)[key];
      if (Array.isArray(val)) {
        flatUpdates[`${basePath}/${key}`] = val;
      } else if (val !== null && typeof val === 'object') {
        flatten(val as Record<string, unknown>, key);
      } else {
        topLevelUpdates[`${basePath}/${key}`] = val;
      }
    }

    // Tambahkan lastUpdated
    flatUpdates[`${basePath}/lastUpdated`] = Date.now();
    Object.assign(flatUpdates, topLevelUpdates);

    await update(ref(db), flatUpdates);
  } catch (error) {
    console.error('Error updating game state:', error);
    throw error;
  }
}

// ─── Fetch Players dari Firebase ─────────────────────────────────────────────

/**
 * Mendengarkan data pemain dalam sebuah ruangan secara real-time.
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
    const playersArray = Object.values(data).map((p: any) => ({
      ...p,
      displayName: p.displayName || p.name || 'Pemain',
    })) as GamePlayer[];
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

    const questionList = Object.keys(data).map((key) => {
      const q = data[key];
      let rawOptions = q.options || q.multiple_choices || [];
      
      // Pastikan options adalah array string (Firebase terkadang mengirim objek)
      const finalOptions = (Array.isArray(rawOptions) ? rawOptions : Object.values(rawOptions))
        .map(opt => {
          if (typeof opt === 'object' && opt !== null) {
            return (opt as any).text || (opt as any).choice || Object.values(opt)[0] || '';
          }
          return String(opt);
        });

      return {
        id: key,
        text: q.text || q.question_text || '',
        options: finalOptions,
        correctIndex: q.correctIndex !== undefined ? q.correctIndex : (q.correct_index !== undefined ? q.correct_index : 0),
        topic: q.topic || ''
      } as UlarTanggaQuestion;
    });
    
    // Filter berdasarkan topik (Kecuali jika topiknya "math", ambil semua untuk testing)
    const filtered = questionList.filter((q) => {
      const isTopicMatch = topicID === 'math' || q.topic === topicID;
      return isTopicMatch && q.text && q.options;
    });

    console.log(`[UlarTangga] Topic: ${topicID} | Total Soal Ditemukan: ${filtered.length}`);
    return filtered;
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
        selectedAnswerIndex: null,
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
    // 1. Bersihkan pemain offline/bot dari daftar players agar tidak nyangkut di Lobby berikutnya
    const activityRef = ref(db, `${gameStateRef(topicID, gameID, roomID)}/playerActivity`);
    const activitySnap = await get(activityRef);
    if (activitySnap.exists()) {
      const activities = activitySnap.val();
      const playersRef = ref(db, `${roomRef(topicID, gameID, roomID)}/players`);
      const playersSnap = await get(playersRef);
      if (playersSnap.exists()) {
        const playersData = playersSnap.val();
        for (const [key, player] of Object.entries(playersData)) {
          const act = activities[(player as any).uid];
          // Jika offline, hapus dari list players
          if (!act || !act.isActive || (Date.now() - act.lastActivity > 60000)) {
            await remove(ref(db, `${roomRef(topicID, gameID, roomID)}/players/${key}`));
          }
        }
      }
    }

    // 2. Reset state game (Pemain aktif/manusia akan dihapus oleh playerLeaveRoom saat mereka pindah halaman)
    await set(ref(db, gameStateRef(topicID, gameID, roomID)), null);
    await set(ref(db, `${roomRef(topicID, gameID, roomID)}/gameTimer`), null);
    await setGameStatus(topicID, gameID, roomID, null);
    await setGameStartStatus(topicID, gameID, roomID, false);
    await set(ref(db, `${roomRef(topicID, gameID, roomID)}/chatMessages`), null);
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
    await update(activityRef, {
      lastActivity: Date.now(),
      isActive: true,
    });
  } catch (error) {
    console.error('Error updating player activity:', error);
  }
}

export async function setPlayerOffline(
  topicID: string,
  gameID: string,
  roomID: string,
  userUID: string,
): Promise<void> {
  if (!topicID || !gameID || !roomID || !userUID) return;
  const db = getFirebaseDb();
  const activityRef = ref(
    db,
    `${gameStateRef(topicID, gameID, roomID)}/playerActivity/${userUID}`,
  );
  try {
    await update(activityRef, {
      lastActivity: Date.now(),
      isActive: false,
    });

    // Cek apakah masih ada pemain manusia yang online
    const actSnap = await get(ref(db, `${gameStateRef(topicID, gameID, roomID)}/playerActivity`));
    if (actSnap.exists()) {
      const activities = actSnap.val();
      let hasOnline = false;
      for (const uid of Object.keys(activities)) {
        const act = activities[uid];
        if (act.isActive && (Date.now() - act.lastActivity <= 60000)) {
          hasOnline = true;
          break;
        }
      }
      
      // Jika semua pemain sudah keluar / offline (hanya tersisa bot/ghost)
      if (!hasOnline) {
        // Hancurkan game ini sepenuhnya dan kembalikan ke Lobby kosong
        const rRef = roomRef(topicID, gameID, roomID);
        const updates: any = {};
        updates[`${rRef}/gameStarted`] = false;
        updates[`${rRef}/gameStatus`] = 'waiting';
        updates[`${rRef}/gameState`] = null;
        updates[`${rRef}/players`] = null;
        updates[`${rRef}/currentPlayers`] = 0;
        await update(ref(db), updates);
      }
    }
  } catch (error) {
    console.error('Error setting player offline:', error);
  }
}

// ─── Core Gameplay Logic ─────────────────────────────────────────────────────

/**
 * Memindahkan pion pemain berdasarkan angka dadu.
 */
export async function movePawn(
  topicID: string,
  gameID: string,
  roomID: string,
  playerIndex: number,
  steps: number,
): Promise<void> {
  const state = await getGameState(topicID, gameID, roomID);
  if (!state || !state.pionPositions) {
    console.error('GameState atau pionPositions tidak ditemukan');
    return;
  }

  const currentPos = state.pionPositions[playerIndex] ?? 0;
  let newPos = currentPos + steps;

  // Jika melebihi 100, tetap di tempat
  if (newPos > 100) newPos = currentPos;

  const isExtraTurn = steps === 6;
  const nextPlayer = isExtraTurn ? playerIndex : (playerIndex + 1) % state.pionPositions.length;
  const updates: Partial<UlarTanggaGameState> & Record<string, any> = {
    isMoving: false,
    diceState: {
      isRolling: false,
      currentNumber: steps,
      lastRoll: steps,
    },
  };

  // 1. Update posisi pion ke kotak tujuan dadu (Pastikan format array aman)
  const currentPositions = Array.isArray(state.pionPositions) 
    ? [...state.pionPositions] as number[]
    : Object.values(state.pionPositions) as number[];
    
  const newPositions = [...currentPositions];
  newPositions[playerIndex] = newPos;
  updates.pionPositions = newPositions;

  // 2. Cek Tangga (LADDER) sesuai request user
  if (isLadderStart(newPos)) {
    console.log(`[UlarTangga] Pion mendarat di TANGGA (kotak ${newPos})`);
    
    if (!state.questions || state.questions.length === 0) {
      console.warn('[UlarTangga] Soal tidak ditemukan di state game!');
      updates.currentPlayerIndex = nextPlayer;
      await updateGameState(topicID, gameID, roomID, updates);
      return;
    }

    const qIndex = state.currentQuestionIndex || 0;
    const question = state.questions[qIndex];

    if (!question) {
      console.error('Soal pada index ini tidak ditemukan');
      updates.currentPlayerIndex = nextPlayer;
      await updateGameState(topicID, gameID, roomID, updates);
      return;
    }

    // Tampilkan soal
    updates.showQuestion = true;
    updates.waitingForAnswer = true;
    updates.isCorrect = null;
    updates.selectedAnswerIndex = null;
    
    // Shuffle opsi jawaban
    const { shuffledOptions, correctIndex } = shuffleOptions(
      question.options,
      question.correctIndex
    );
    
    updates[`questions/${qIndex}/options`] = shuffledOptions;
    updates[`questions/${qIndex}/correctIndex`] = correctIndex;
    
    await updateGameState(topicID, gameID, roomID, updates);
  } 
  // 3. Cek Ular (SNAKE)
  else if (isSnakeHead(newPos)) {
    const target = getSnakeTarget(newPos);
    if (target) {
      newPositions[playerIndex] = target;
      updates.pionPositions = newPositions;
    }
    updates.currentPlayerIndex = nextPlayer;
    await updateGameState(topicID, gameID, roomID, updates);
  }
  // 4. Kotak Biasa
  else {
    updates.currentPlayerIndex = nextPlayer;
    await updateGameState(topicID, gameID, roomID, updates);
  }
}

/**
 * Menangani jawaban user untuk tantangan tangga.
 */
export async function submitAnswer(
  topicID: string,
  gameID: string,
  roomID: string,
  selectedIndex: number,
): Promise<void> {
  const state = await getGameState(topicID, gameID, roomID);
  if (!state || !state.waitingForAnswer) return;

  const qIndex = state.currentQuestionIndex;
  const question = state.questions[qIndex];
  const isCorrect = selectedIndex === question.correctIndex;

  const updates: Partial<UlarTanggaGameState> & Record<string, any> = {
    isCorrect,
    selectedAnswerIndex: selectedIndex,
    waitingForAnswer: false,
    // currentQuestionIndex dipindah ke nextTurn agar soal tidak langsung ganti di UI
  };

  const playerIndex = state.currentPlayerIndex;
  const currentPos = state.pionPositions[playerIndex];

  if (isCorrect) {
    // Jika benar: naik tangga
    const target = getLadderTarget(currentPos);
    if (target) {
      console.log(`[UlarTangga] Jawaban BENAR! Naik dari ${currentPos} ke ${target}`);
      
      const currentPositions = Array.isArray(state.pionPositions) 
        ? [...state.pionPositions] as number[]
        : Object.values(state.pionPositions) as number[];
        
      const newPositions = [...currentPositions];
      newPositions[playerIndex] = target;
      updates.pionPositions = newPositions;
    } else {
      console.warn(`[UlarTangga] Target tangga tidak ditemukan untuk posisi ${currentPos}`);
    }
  } else {
    console.log(`[UlarTangga] Jawaban SALAH! Tetap di kotak ${currentPos}`);
  }

  // Berikan jeda sedikit untuk UI menampilkan warna (highlight) sebelum tutup modal dan ganti turn
  // Namun karena ini service, kita hanya update state isCorrect. 
  // UI akan mendengarkan isCorrect dan memberikan highlight.
  // Setelah jeda (di handled oleh hook/UI), turn akan berganti.
  
  await updateGameState(topicID, gameID, roomID, updates);

  // Fungsi untuk mengganti turn bisa dipanggil dari sini atau dari hook setelah delay
}

/**
 * Memindahkan giliran ke pemain berikutnya.
 */
export async function nextTurn(
  topicID: string,
  gameID: string,
  roomID: string
): Promise<void> {
  const state = await getGameState(topicID, gameID, roomID);
  if (!state) return;

  const isExtraTurn = state.diceState?.lastRoll === 6;
  const nextPlayerIndex = isExtraTurn 
    ? state.currentPlayerIndex 
    : (state.currentPlayerIndex + 1) % state.pionPositions.length;

  await updateGameState(topicID, gameID, roomID, {
    currentPlayerIndex: nextPlayerIndex,
    showQuestion: false,
    isCorrect: null,
    selectedAnswerIndex: null,
    // Update index soal di sini setelah panel tertutup
    currentQuestionIndex: (state.currentQuestionIndex + 1) % (state.questions?.length || 1),
    diceState: {
      isRolling: false,
      currentNumber: 1,
      lastRoll: state.diceState?.lastRoll || 1,
    },
  });
}

/**
 * Helper untuk shuffle opsi jawaban tanpa kehilangan jejak jawaban benar.
 */
function shuffleOptions(options: string[], correctIndex: number) {
  const correctText = options[correctIndex];
  const shuffledOptions = shuffle([...options]);
  const newCorrectIndex = shuffledOptions.indexOf(correctText);
  return { shuffledOptions, correctIndex: newCorrectIndex };
}
