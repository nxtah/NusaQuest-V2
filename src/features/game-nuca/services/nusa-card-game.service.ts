import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { firebaseFirestore } from '@/src/lib/firebase/client';
// `getQuestions` (bukan yang dipakai di sini) butuh composite index Firestore
// (mapId+regionId+isActive+isApproved+createdAt) yang belum ke-deploy — persis
// error yang muncul di console. `getQuestionsByRegion` query-nya sengaja cuma
// filter mapId di Firestore, sisanya (regionId/isActive/isApproved) di-filter
// client-side, jadi gak butuh index sama sekali — pola yang sama persis
// dipakai ular-tangga-game.service.ts buat alasan yang sama.
import { getQuestionsByRegion as getFsQuestions } from './questions.service';
import { getRegionById } from '@/src/features/destination/services/regions.service';

const GAME_STATES_COLLECTION = 'gameStates';
const ROOMS_COLLECTION = 'rooms';

// Berapa kartu yang dibagi ke tiap pemain pas game mulai — sisanya (kalau
// soal yang di-fetch lebih banyak dari kebutuhan) disimpan di `drawPile`
// buat kartu tambahan pas ada yang jawab salah (lihat submitAnswer).
const CARDS_PER_PLAYER = 5;
// Sama persis kayak threshold staleness per-pemain di ular-tangga-game.service.ts
// — disamain biar definisi "pemain offline" konsisten di seluruh app. Dipake
// buat bot-takeover 1 giliran doang (throw/answer random buat pemain yang lagi
// stale) — aksi yang REVERSIBLE & low-stakes, jadi ambang 60 detik oke.
const STALE_MS = 60_000;
// Ambang staleness KHUSUS buat checkAndFinalizeSoleSurvivor — SENGAJA jauh
// lebih longgar dari STALE_MS. Beda taruhannya: nge-declare "lawan
// disconnect, game selesai" itu IRREVERSIBLE (langsung nutup game + buka
// room lagi), beda sama sekadar bot ngelempar/jawab 1 giliran doang. 60
// detik kebukti KEGANTENG dipake buat ini pas dites nyata — 1 tab browser
// yang lagi gak fokus (biasa kejadian pas tes manual pake >1 tab di 1
// device) gampang ke-throttle sama browser & telat ngirim heartbeat >60
// detik padahal pemainnya masih di situ, bukan beneran kabur.
export const SOLE_SURVIVOR_STALE_MS = 3 * 60_000;
// Idle GLOBAL (bukan per-pemain) — kalau gak ada aksi apapun dari SIAPAPUN
// selama ini, game dianggap invalid & di-reset. Beda konsep dari STALE_MS
// (itu buat deteksi 1 pemain disconnect, bukan seluruh meja diam).
const GLOBAL_IDLE_MS = 8 * 60_000;
// Batas waktu buat pelempar milih & lempar kartu — beda dari GLOBAL_IDLE_MS
// (itu 8 MENIT, buat seluruh meja diem; ini 10 DETIK, buat 1 giliran lempar
// doang, berlaku ke SEMUA pemain — bukan cuma yang disconnect).
const THROW_TIMEOUT_MS = 10_000;
// Batas waktu buat SI PENJAWAB milih jawaban — beda dari THROW_TIMEOUT_MS
// (itu buat pelempar milih kartu). Telat = otomatis dianggap salah (lewat
// jalur submitAnswer yang sama persis kayak salah jawab manual), bukan
// tebakan acak — jujur mencerminkan "kehabisan waktu".
export const ANSWER_TIMEOUT_MS = 8_000;

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

// Dipanggil proaktif begitu game beneran selesai (menang normal ATAU
// sole-survivor) — biar room langsung kebuka lagi buat orang lain, bukan
// nunggu ada yang KEBETULAN visit ulang room dan mentrigger reset lain.
async function reopenRoom(roomID: string): Promise<void> {
  try {
    const roomRef = roomDocRef(roomID);
    const updates: Record<string, unknown> = { status: 'waiting', gameStarted: false };
    // Ikut bersihin `players.{uid}.isActive` semua penghuni lama — sama
    // alasan kayak versi ular-tangga: field ini cuma ke-update pas pemain
    // LEAVE, bukan pas game/room-nya di-reset, jadi badge okupansi lobby
    // bisa masih nampilin "N orang" di room yang udah beneran kosong.
    const roomSnap = await getDoc(roomRef);
    const players = roomSnap.exists() ? (roomSnap.data().players as Record<string, unknown> | undefined) : undefined;
    if (players) {
      for (const uid of Object.keys(players)) {
        updates[`players.${uid}.isActive`] = false;
      }
    }
    await updateDoc(roomRef, updates);
  } catch (error) {
    console.error('Error reopening NusaCard room:', error);
  }
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

export interface PlayerActivity {
  lastActivity: number;
  isActive: boolean;
}

export interface NusaCardGameState {
  players: NusaCardPlayer[];
  playerHands: Record<string, NusaCardQuestion[]>;
  /** Sisa soal yang belum dibagi — sumber kartu tambahan pas jawaban salah. */
  drawPile: NusaCardQuestion[];
  /** Index di `players` — giliran siapa melempar kartu. */
  currentThrowerIndex: number;
  /** Kapan giliran lempar SEKARANG mulai — dasar hitung mundur 10 detik. */
  throwerTurnStartedAt: number;
  activeQuestion: NusaCardQuestion | null;
  activeThrowerUID: string | null;
  /** Satu-satunya pemain yang kebagian jawab kartu aktif (bukan antrean semua orang). */
  currentAnsweringUID: string | null;
  /** Kapan jendela jawab SEKARANG mulai — dasar hitung mundur 8 detik.
      Cuma valid selagi `currentAnsweringUID`/`activeQuestion` keisi, dan
      di-null-in bareng keduanya. */
  answerTurnStartedAt: number | null;
  /** UID dalam urutan selesai (index 0 = juara 1) — kartunya abis duluan. */
  finishedOrder: string[];
  playerActivity: Record<string, PlayerActivity>;
  gameStatus: 'playing' | 'finished' | 'timeout' | 'abandoned';
  gameCreatedAt: number;
  lastUpdated: number;
  /** Kapan terakhir kali ADA aksi nyata (lempar/jawab) — dasar cek idle global. */
  lastActionAt: number;
  /** UID yang udah nge-claim reward (badge/potion) buat game ini — guard
      biar gak ke-double-grant kalau client reconnect/buka ulang RankModal. */
  rewardsClaimedBy?: string[];
  /** UID yang statistiknya (win-streak/achievement) udah ke-proses buat
      game ini — guard terpisah dari `rewardsClaimedBy` karena ini jalan
      buat SEMUA pemain (menang atau kalah), bukan cuma rank 1-3. */
  statsRecordedBy?: string[];
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

/**
 * Bagi CARDS_PER_PLAYER kartu ke tiap pemain round-robin; sisanya jadi
 * drawPile. Kalau soal ASLI yang tersedia (dari Firestore, region yang
 * dipilih) kurang dari kebutuhan (`players.length * CARDS_PER_PLAYER`) —
 * gampang kejadian selama region-nya belum diisi banyak soal approved lewat
 * admin panel — soal yang ada di-SIKLUS ULANG (reshuffle tiap putaran) biar
 * SEMUA pemain tetap kebagian tangan penuh 5 kartu, bukan tangan
 * jomplang/kosong kayak sebelumnya. Begitu region-nya udah diisi cukup
 * banyak soal approved, siklus ini otomatis gak kepake lagi (dealCount bakal
 * kepenuhan dari soal unik doang, gak perlu diulang).
 */
function dealHandsAndDrawPile(
  players: NusaCardPlayer[],
  questions: NusaCardQuestion[],
): { hands: Record<string, NusaCardQuestion[]>; drawPile: NusaCardQuestion[] } {
  const hands: Record<string, NusaCardQuestion[]> = {};
  players.forEach((p) => { hands[p.uid] = []; });

  const totalNeeded = players.length * CARDS_PER_PLAYER;
  if (questions.length === 0) return { hands, drawPile: [] };

  let supply = shuffle(questions);
  while (supply.length < totalNeeded) {
    supply = supply.concat(shuffle(questions));
  }

  const dealCount = Math.min(totalNeeded, supply.length);
  for (let i = 0; i < dealCount; i++) {
    hands[players[i % players.length].uid].push(supply[i]);
  }

  return { hands, drawPile: supply.slice(dealCount) };
}

export async function initializeNusaCardGameState(
  roomID: string,
  players: NusaCardPlayer[],
  questions: NusaCardQuestion[],
): Promise<void> {
  const { hands, drawPile } = dealHandsAndDrawPile(players, questions);

  const playerActivity: Record<string, PlayerActivity> = {};
  const now = Date.now();
  players.forEach((p) => { playerActivity[p.uid] = { lastActivity: now, isActive: true }; });

  const initialState: NusaCardGameState = {
    players,
    playerHands: hands,
    drawPile,
    currentThrowerIndex: 0,
    throwerTurnStartedAt: now,
    activeQuestion: null,
    activeThrowerUID: null,
    currentAnsweringUID: null,
    answerTurnStartedAt: null,
    finishedOrder: [],
    playerActivity,
    gameStatus: 'playing',
    gameCreatedAt: now,
    lastUpdated: now,
    lastActionAt: now,
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

/** Pemain aktif = belum masuk finishedOrder (masih megang kartu / masih main). */
function activePlayers(state: NusaCardGameState): NusaCardPlayer[] {
  return state.players.filter((p) => !state.finishedOrder.includes(p.uid));
}

/** Pemain aktif berikutnya setelah `afterUID`, muter di antara pemain aktif aja. */
function nextActivePlayerAfter(state: NusaCardGameState, afterUID: string): NusaCardPlayer | null {
  const active = activePlayers(state);
  if (active.length === 0) return null;
  const afterIdx = active.findIndex((p) => p.uid === afterUID);
  if (afterIdx === -1) return active[0];
  return active[(afterIdx + 1) % active.length];
}

/**
 * Ambil 1 kartu random buat penalti (salah jawab / gak sempet lempar) —
 * dari `drawPile` kalau masih ada, fallback pinjem ulang soal random dari
 * tangan pemain manapun kalau `drawPile` udah abis, biar mekanismenya gak
 * pernah macet gara-gara kehabisan soal.
 */
function drawPenaltyCard(
  drawPile: NusaCardQuestion[],
  playerHands: Record<string, NusaCardQuestion[]>,
  recipientUID: string,
  fallback: NusaCardQuestion,
): { drawn: NusaCardQuestion; drawPile: NusaCardQuestion[] } {
  if (drawPile.length > 0) {
    const [drawn, ...rest] = drawPile;
    return { drawn, drawPile: rest };
  }
  // Kecualiin tangan si PENERIMA sendiri dari pool — kalau enggak, dia bisa
  // kebagian kartu yang udah dia pegang (id sama persis 2x di array yang
  // sama), yang bikin React ngeluh "two children with the same key" di
  // PlayerHandCards.
  const pool = Object.entries(playerHands)
    .filter(([uid]) => uid !== recipientUID)
    .flatMap(([, hand]) => hand);
  return { drawn: pool[Math.floor(Math.random() * pool.length)] ?? fallback, drawPile };
}

/**
 * Pemain melempar 1 kartu dari tangannya sendiri ke pemain aktif berikutnya
 * (urutan giliran). Kalau tangannya abis SETELAH lempar ini, dia langsung
 * "selesai" (masuk finishedOrder) — gak peduli jawaban kartu ini bener/salah,
 * karena penalti salah jawab itu punya PENJAWAB, bukan pelempar.
 */
export async function throwCard(roomID: string, throwerUID: string, cardId: string): Promise<void> {
  const ref = gameStateDocRef(roomID);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return;
  const state = snapshot.data() as NusaCardGameState;

  const thrower = state.players[state.currentThrowerIndex];
  if (!thrower || thrower.uid !== throwerUID || state.activeQuestion) return;

  const hand = state.playerHands[throwerUID] ?? [];
  // Cari INDEX-nya, bukan filter by id — sejak §73 (siklus ulang soal biar
  // tangan selalu 5 kartu di region yang masih tipis), gampang banget 1
  // tangan isinya beberapa kartu dengan `id` soal yang SAMA PERSIS.
  // `hand.filter(c => c.id !== cardId)` bakal mbuang SEMUA kartu yang
  // id-nya sama, bukan cuma 1 kartu fisik yang dilempar — bikin tangan
  // ke-kosongin sekaligus abis 1 lemparan (ini penyebab asli "jawab sekali
  // langsung selesai" yang dilaporkan user, BUKAN soal konten/deal).
  const cardIndex = hand.findIndex((c) => c.id === cardId);
  if (cardIndex === -1) return;
  const card = hand[cardIndex];

  const nextHand = [...hand.slice(0, cardIndex), ...hand.slice(cardIndex + 1)];
  const now = Date.now();

  let finishedOrder = state.finishedOrder;
  if (nextHand.length === 0) {
    finishedOrder = [...state.finishedOrder, throwerUID];
  }

  const nextState: NusaCardGameState = {
    ...state,
    playerHands: { ...state.playerHands, [throwerUID]: nextHand },
    finishedOrder,
  };
  const answerer = nextActivePlayerAfter(nextState, throwerUID);

  // Gak ada lagi pemain aktif lain buat jawab — game langsung kelar,
  // sisa 1 pemain (kalau ada) otomatis dapet peringkat terakhir.
  if (!answerer) {
    const stillActive = activePlayers(nextState).filter((p) => p.uid !== throwerUID);
    const finalOrder = stillActive.length > 0
      ? [...finishedOrder, ...stillActive.map((p) => p.uid)]
      : finishedOrder;
    await updateDoc(ref, {
      playerHands: nextState.playerHands,
      finishedOrder: finalOrder,
      activeQuestion: null,
      activeThrowerUID: null,
      currentAnsweringUID: null,
      answerTurnStartedAt: null,
      gameStatus: 'finished',
      lastUpdated: now,
      lastActionAt: now,
    });
    return;
  }

  await updateDoc(ref, {
    playerHands: nextState.playerHands,
    finishedOrder,
    activeQuestion: card,
    activeThrowerUID: throwerUID,
    currentAnsweringUID: answerer.uid,
    answerTurnStartedAt: now,
    lastUpdated: now,
    lastActionAt: now,
  });
}

/**
 * Pelempar gak sempet milih kartu dalam THROW_TIMEOUT_MS (10 detik) — dia
 * GAK jadi lempar, tapi tangannya nambah 1 kartu random (penalti), lalu
 * giliran lempar pindah ke pemain aktif berikutnya. Berlaku ke SEMUA
 * pemain (bukan cuma yang disconnect) — makanya ini terpisah dari mekanisme
 * offline-resilience/bot-takeover yang ada di halaman play.
 *
 * Aman dipanggil berkali-kali/dari client manapun: guard di bawah bikin ini
 * no-op kalau kartu udah kelanjur dilempar, giliran udah pindah, atau
 * deadline-nya belum lewat.
 */
export async function handleThrowTimeout(roomID: string, throwerUID: string): Promise<void> {
  try {
    const ref = gameStateDocRef(roomID);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return;
    const state = snapshot.data() as NusaCardGameState;

    const thrower = state.players[state.currentThrowerIndex];
    if (!thrower || thrower.uid !== throwerUID || state.activeQuestion) return;
    if (Date.now() - state.throwerTurnStartedAt < THROW_TIMEOUT_MS) return;

    const now = Date.now();
    const { drawn, drawPile } = drawPenaltyCard(
      state.drawPile,
      state.playerHands,
      throwerUID,
      state.playerHands[throwerUID]?.[0],
    );
    const playerHands = {
      ...state.playerHands,
      [throwerUID]: [...(state.playerHands[throwerUID] ?? []), drawn].filter(Boolean),
    };

    const nextState: NusaCardGameState = { ...state, playerHands, drawPile };
    const nextThrower = nextActivePlayerAfter(nextState, throwerUID);

    if (!nextThrower) {
      // Gak ada pemain aktif lain (harusnya jarang kejadian) — selesaikan game.
      await updateDoc(ref, {
        playerHands,
        drawPile,
        activeQuestion: null,
        gameStatus: 'finished',
        lastUpdated: now,
        lastActionAt: now,
      });
      return;
    }

    const nextThrowerIndex = state.players.findIndex((p) => p.uid === nextThrower.uid);
    await updateDoc(ref, {
      playerHands,
      drawPile,
      currentThrowerIndex: nextThrowerIndex === -1 ? state.currentThrowerIndex : nextThrowerIndex,
      throwerTurnStartedAt: now,
      lastUpdated: now,
      lastActionAt: now,
    });
  } catch (error) {
    console.error('Error handling NusaCard throw timeout:', error);
  }
}

/**
 * Satu-satunya pemain yang kebagian jawab submit pilihannya. Salah -> dapet
 * 1 kartu baru random (dari drawPile, fallback ke pool asli lagi kalau
 * drawPile abis biar mekanismenya gak pernah macet). Bener -> tangannya gak
 * berubah. Giliran lempar berikutnya PINDAH KE PENJAWAB INI (bukan geser
 * index kayak ular tangga) — dikonfirmasi user.
 */
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
  const now = Date.now();

  let playerHands = state.playerHands;
  let drawPile = state.drawPile;
  if (!isCorrect) {
    const { drawn, drawPile: rest } = drawPenaltyCard(drawPile, state.playerHands, answeringUID, state.activeQuestion);
    drawPile = rest;
    playerHands = {
      ...state.playerHands,
      [answeringUID]: [...(state.playerHands[answeringUID] ?? []), drawn],
    };
  }

  const nextThrowerIndex = state.players.findIndex((p) => p.uid === answeringUID);

  const nextState: NusaCardGameState = {
    ...state,
    playerHands,
    drawPile,
    currentThrowerIndex: nextThrowerIndex === -1 ? state.currentThrowerIndex : nextThrowerIndex,
  };

  const remaining = activePlayers(nextState);
  if (remaining.length <= 1) {
    const finalOrder = remaining.length === 1
      ? [...state.finishedOrder, remaining[0].uid]
      : state.finishedOrder;
    await updateDoc(ref, {
      playerHands,
      drawPile,
      finishedOrder: finalOrder,
      activeQuestion: null,
      activeThrowerUID: null,
      currentAnsweringUID: null,
      answerTurnStartedAt: null,
      gameStatus: 'finished',
      lastUpdated: now,
      lastActionAt: now,
    });
    return { isCorrect };
  }

  await updateDoc(ref, {
    playerHands,
    drawPile,
    currentThrowerIndex: nextState.currentThrowerIndex,
    throwerTurnStartedAt: now,
    activeQuestion: null,
    activeThrowerUID: null,
    currentAnsweringUID: null,
    answerTurnStartedAt: null,
    lastUpdated: now,
    lastActionAt: now,
  });

  return { isCorrect };
}

export function updatePlayerActivity(roomID: string, playerId: string): Promise<void> {
  const ref = gameStateDocRef(roomID);
  return updateDoc(ref, {
    [`playerActivity.${playerId}`]: { lastActivity: Date.now(), isActive: true },
    lastUpdated: Date.now(),
  });
}

export async function setPlayerOffline(roomID: string, playerId: string): Promise<void> {
  try {
    const ref = gameStateDocRef(roomID);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return;
    const state = snapshot.data() as NusaCardGameState;
    if (state.playerActivity?.[playerId]) {
      await updateDoc(ref, { [`playerActivity.${playerId}.isActive`]: false });
    }
  } catch (error) {
    console.error('Error setting NusaCard player offline:', error);
  }
}

/** Sama makna dengan versi ular-tangga — dipakai buat bot-takeover di UI.
    `staleMs` bisa di-override (lihat SOLE_SURVIVOR_STALE_MS) buat kasus yang
    taruhannya lebih tinggi daripada sekadar bot ngambil alih 1 giliran. */
export function isPlayerStale(
  activity: PlayerActivity | undefined,
  now = Date.now(),
  staleMs: number = STALE_MS,
): boolean {
  if (!activity) return true;
  return !activity.isActive || now - activity.lastActivity > staleMs;
}

/**
 * Cek idle GLOBAL (bukan per-pemain) — kalau gak ada aksi apapun dari
 * siapapun selama GLOBAL_IDLE_MS, game & room di-invalidate. Aman dipanggil
 * berkali-kali dari client manapun (idempotent lewat guard gameStatus).
 */
export async function checkAndInvalidateIfIdle(roomID: string): Promise<void> {
  try {
    const ref = gameStateDocRef(roomID);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return;
    const state = snapshot.data() as NusaCardGameState;
    if (state.gameStatus !== 'playing') return;
    if (Date.now() - state.lastActionAt <= GLOBAL_IDLE_MS) return;

    await updateDoc(ref, { gameStatus: 'timeout', lastUpdated: Date.now() });
    await reopenRoom(roomID);
  } catch (error) {
    console.error('Error checking/invalidating idle NusaCard game:', error);
  }
}

/**
 * Dipanggil dari client pemain yang masih aktif — kalau ternyata dia
 * satu-satunya pemain yang belum "selesai" (finishedOrder) DAN masih aktif
 * (lawan-lawannya keluar tab/nutup browser tanpa sempet ngabisin tangan),
 * dia otomatis dianggap SELESAI DUAN — ranked tepat setelah siapapun yang
 * udah legit selesai lebih dulu, dan SEBELUM pemain-pemain yang ditinggal
 * stale (mereka gak pernah legit ngabisin tangan, jadi peringkat mereka di
 * bawah si survivor). Beda dari kasus "abis lempar/jawab, tinggal 1 pemain
 * aktif" yang udah dihandle throwCard/submitAnswer — itu trigger dari AKSI
 * nyata; ini trigger dari HEARTBEAT, buat kasus lawan disconnect tanpa aksi
 * apapun lagi (makanya throwCard/submitAnswer gak pernah kepanggil buat
 * nutup game-nya). Idempotent lewat guard gameStatus!=='playing'.
 */
export async function checkAndFinalizeSoleSurvivor(roomID: string): Promise<void> {
  try {
    const ref = gameStateDocRef(roomID);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return;

    const state = snapshot.data() as NusaCardGameState;
    if (state.gameStatus !== 'playing') return;

    const nonFinished = state.players.filter((p) => !state.finishedOrder.includes(p.uid));
    if (nonFinished.length <= 1) return;

    const now = Date.now();
    const activeNonFinished = nonFinished.filter(
      (p) => !isPlayerStale(state.playerActivity?.[p.uid], now, SOLE_SURVIVOR_STALE_MS),
    );
    if (activeNonFinished.length !== 1) return;

    const survivor = activeNonFinished[0];
    const staleOthers = nonFinished.filter((p) => p.uid !== survivor.uid);
    const finalOrder = [...state.finishedOrder, survivor.uid, ...staleOthers.map((p) => p.uid)];

    await updateDoc(ref, {
      finishedOrder: finalOrder,
      activeQuestion: null,
      activeThrowerUID: null,
      currentAnsweringUID: null,
      answerTurnStartedAt: null,
      gameStatus: 'finished',
      lastUpdated: now,
    });
    await reopenRoom(roomID);
  } catch (error) {
    console.error('Error finalizing NusaCard sole-survivor win:', error);
  }
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
