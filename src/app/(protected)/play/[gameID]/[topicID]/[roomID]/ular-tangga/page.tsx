"use client";


import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useRouter, useParams} from 'next/navigation';

import GameBackground from '@/src/features/game-ular-tangga/components/GameBackground';
import Board from '@/src/features/game-ular-tangga/components/Board';
import PlayerTurnBox from '@/src/features/game-ular-tangga/components/PlayerTurnBox';
import {ularTangga} from '@/src/assets/images/ular-tangga/cloudinaryAssets';
import PauseModal from '@/src/components/layout/PauseModal';
import WinModal from '@/src/features/game-ular-tangga/components/WinModal';
import Loader from '@/src/components/ui/Loader';
import SettingButton from '@/src/components/layout/SettingButton';
import {useAuth} from '@/src/features/auth/hooks/useAuth';
import {claimGameReward, getUserProfile, consumePotion, recordMatchOutcome, type GameReward} from '@/src/services/firebase/firestore/users.service';
import {pickBotAnswerIndex} from '@/src/lib/utils/bot-behavior';

import {
  fetchGamePlayers,
  listenToGameState,
  listenToGameStart,
  updateGameState,
  updatePlayerActivity,
  setPlayerOffline,
  checkAndFinalizeSoleSurvivor,
  checkAndInvalidateIfIdle,
  movePawn,
  submitAnswer,
  nextTurn,
  ANSWER_TIMEOUT_MS,
  ROLL_TIMEOUT_MS,
  type UlarTanggaGameState,
  type GamePlayer,
} from '@/src/features/game-ular-tangga/services/ular-tangga-game.service';
import {playerJoinRoom, playerLeaveRoom, markPlayerInactiveInRoom} from '@/src/features/lobby/services/lobby.service';
import {LADDERS, SNAKES, isLadderStart, isSnakeHead} from '@/src/features/game-ular-tangga/utils/board-rules';

// ─── Avatar pion per index ──────────────────────────────────────────────────
const PION_AVATARS = [
  ularTangga.pion1,
  ularTangga.pion2,
  ularTangga.pion3,
  ularTangga.pion4,
];

const ACTIVITY_INTERVAL_MS = 30_000;

export default function UlarTanggaPage() {
  const router = useRouter();
  const params = useParams();

  const gameID = params?.gameID as string;
  const topicID = params?.topicID as string;
  const roomID = params?.roomID as string;
  // Dokumen Firestore di-scope per game+topik+slot, bukan cuma slug roomID
  // mentah — biar sesi game beda yang kebetulan pakai slot sama gak numpuk.
  const roomKey = `${gameID}_${topicID}_${roomID}`;
  const roomPath = `/room/${gameID}/${topicID}/${roomID}`;

  // ── Auth ─────────────────────────────────────────────────────────────────
  const {user} = useAuth();
  const myUID = user?.uid ?? null;

  // ── State ────────────────────────────────────────────────────────────────
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [gameState, setGameState] = useState<UlarTanggaGameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [isGameLocked, setIsGameLocked] = useState<boolean>(false);

  const gameStartedRef = useRef<boolean>(false);
  useEffect(() => {
    gameStartedRef.current = gameStarted;
  }, [gameStarted]);

  const activityTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestPlayersRef = useRef<GamePlayer[]>([]);
  const [now, setNow] = useState<number>(0);

  // ── Langkah 1: Subscribe ke pemain Firebase & Auto Join ───────────
  useEffect(() => {
    if (!topicID || !gameID || !roomID || !user) return;

    let isJoined = false;

    const joinRoom = async () => {
      try {
        await playerJoinRoom(
          topicID,
          gameID,
          roomKey,
          user.uid,
          user.displayName || 'Pemain',
          user.googlePhotoURL || user.firebasePhotoURL || undefined
        );
        isJoined = true;
      } catch (error) {
        const msg = error instanceof Error ? error.message : '';
        if (msg === 'Permainan sedang berlangsung') {
          setIsGameLocked(true);
          setLoading(false);
        }
      }
    };
    joinRoom();

    const unsub = fetchGamePlayers(topicID, gameID, roomKey, (fetchedPlayers) => {
      latestPlayersRef.current = fetchedPlayers;
      setPlayers(fetchedPlayers);
    });

    return () => {
      unsub();
      // Saat komponen unmount (keluar halaman):
      // Jika game BELUM mulai, keluarkan user dari room.
      // Jika game SUDAH mulai, ubah status jadi offline (agar bot jalan & bisa reconnect).
      if (isJoined) {
        if (!gameStartedRef.current) {
          playerLeaveRoom(topicID, gameID, roomKey, user.uid).catch(() => { });
        } else {
          setPlayerOffline(topicID, gameID, roomKey, user.uid).catch(() => { });
          // `setPlayerOffline` doang cuma nyentuh gameState (playerActivity)
          // — badge okupansi lobby (RoomSelect.tsx) baca `room.players[uid]
          // .isActive`, field TERPISAH yang gak pernah ke-update kalau keluar
          // mid-game, bikin room ke-lock "Sedang Bermain" selamanya walau
          // pemainnya udah lama kabur. Update juga di sini.
          markPlayerInactiveInRoom(roomKey, user.uid).catch(() => { });
        }
      }
    };
  }, [topicID, gameID, roomKey, user]);

  // ── Subscribe ke status Game Started ─────────────────────────────
  useEffect(() => {
    if (!topicID || !gameID || !roomID) return;
    const unsub = listenToGameStart(topicID, gameID, roomKey, (isStarted) => {
      setGameStarted(isStarted);
      if (!isStarted) {
        setLoading(false); // Sudah masuk lobby, berhenti loading
      }
    });
    return () => unsub();
  }, [topicID, gameID, roomKey]);

  // ── Langkah 3: Subscribe ke gameState Firebase (real-time) ───────────────
  useEffect(() => {
    if (!topicID || !gameID || !roomID || !gameStarted) return;

    const unsub = listenToGameState(topicID, gameID, roomKey, (state) => {
      setGameState(state);
      setLoading(false);

      if (!state) return;
      // 'finished' TIDAK auto-redirect lagi — WinModal di bawah yang nangani,
      // user klik tombolnya sendiri buat lanjut. 'abandoned' DAN 'timeout'
      // (idle global 8 menit, gak ada satupun pemain yang gerak) sama-sama
      // balik ke lobby room ini — game dianggap invalid, bukan ke home.
      if (state.gameStatus === 'abandoned' || state.gameStatus === 'timeout') {
        router.push(`/lobby/${topicID}/${gameID}`);
      }
    });

    return () => unsub();
  }, [topicID, gameID, roomKey, gameStarted, router]);

  // ── Update aktivitas pemain secara berkala + cek idle global + auto-cleanup
  //    saat keluar ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!myUID || !topicID || !gameID || !roomID || !gameStarted) return;

    updatePlayerActivity(topicID, gameID, roomKey, myUID);

    activityTimerRef.current = setInterval(() => {
      updatePlayerActivity(topicID, gameID, roomKey, myUID);
      // Idle GLOBAL (bukan per-pemain) — aman dipanggil dari client manapun,
      // idempotent lewat guard gameStatus di dalam fungsinya sendiri.
      void checkAndInvalidateIfIdle(roomKey);
    }, ACTIVITY_INTERVAL_MS);

    return () => {
      if (activityTimerRef.current) clearInterval(activityTimerRef.current);
    };
  }, [myUID, topicID, gameID, roomKey, gameStarted]);


  // ── Computed values ──────────────────────────────────────────────────────
  // Urutkan players berdasarkan playerUIDs dari gameState agar index konsisten
  // meski Firestore Object.entries() berubah urutan saat player baru join.
  const playerUIDsKey = gameState?.playerUIDs?.join(',') ?? '';
  const orderedPlayers = useMemo(() => {
    return gameState?.playerUIDs?.length
      ? gameState.playerUIDs
          .map((uid) => players.find((p) => p.uid === uid))
          .filter((p): p is GamePlayer => !!p)
      : players;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerUIDsKey, players]);

  const currentPlayerIndex = gameState?.currentPlayerIndex ?? 0;
  // Pakai currentPlayerUID dari Firestore — tidak bergantung urutan array lokal.
  const currentPlayerUID = gameState?.currentPlayerUID ?? orderedPlayers[currentPlayerIndex]?.uid;
  const currentPlayer = orderedPlayers.find((p) => p.uid === currentPlayerUID) ?? orderedPlayers[currentPlayerIndex];
  const isMyTurn = !!myUID && currentPlayerUID === myUID;
  const isDiceDisabled = !gameState || gameState.isMoving || gameState.waitingForAnswer || gameState.showQuestion;
  const winnerUID = gameState?.gameWinnerUID;
  // Dipake buat RankModal — finishedOrder KOSONG selama game masih jalan,
  // cuma keisi lengkap begitu gameStatus 'finished'.
  const rankedPlayers = useMemo(() => {
    if (!gameState) return [];
    return (gameState.finishedOrder ?? []).map((uid) => {
      const p = orderedPlayers.find((pl) => pl.uid === uid) ?? players.find((pl) => pl.uid === uid);
      return { uid, name: p?.displayName || p?.name || 'Pemain', photoURL: p?.photoURL };
    });
  }, [gameState, orderedPlayers, players]);
  // Dihitung LANGSUNG di render (bukan di dalam effect) — dulu cuma di-set
  // lewat ref di dalam effect bot-takeover, tapi effect roll-timeout (yang
  // dideklarasi lebih dulu) jalan DULUAN di commit yang sama pas giliran
  // abis dari bot ke pemain asli, jadi sempet baca ref yang masih basi
  // ("true" dari giliran bot yang baru kelar) sebelum effect bot-takeover
  // sempet nge-reset-nya ke false — timer skip 10 detik jadi gak pernah
  // kepasang buat giliran itu. Dihitung sebagai nilai render biasa, kedua
  // effect baca nilai yang sama-sama fresh di commit yang sama.
  const ts = Date.now();
  const currentUID = gameState?.currentPlayerUID ?? orderedPlayers[gameState?.currentPlayerIndex ?? 0]?.uid;
  const activity = currentUID ? gameState?.playerActivity?.[currentUID] : null;
  const offline = activity ? (!activity.isActive || ts - activity.lastActivity > 60000) : false;
  let isBotActingNow = false;
  if (offline && !isMyTurn) {
    const first = orderedPlayers.find((p) => {
      const act = gameState?.playerActivity?.[p.uid];
      return act ? (act.isActive && ts - act.lastActivity <= 60000) : true;
    });
    isBotActingNow = first?.uid === myUID;
  }
  // Ref dipertahankan buat callback di dalam setTimeout (handleDiceRollStart/
  // Complete/handleSelectAnswer) yang butuh baca nilai "hidup" di luar siklus
  // render — di-update tiap render dari nilai yang barusan dihitung di atas.
  const isBotActingRef = useRef(false);
  isBotActingRef.current = isBotActingNow;

  // ── Reward badge/potion begitu game kelar — cuma pemenang yang dapet
  // (Ular Tangga menang-kalah doang, gak ada peringkat 2/3 — bukan bug,
  // emang aturan mainnya gitu, cuma nambah efek samping hadiah di atas
  // kondisi menang yang udah ada). Idempotent lewat `rewardsClaimedBy`.
  const [potionCount, setPotionCount] = useState(0);
  useEffect(() => {
    if (!myUID) return;
    void getUserProfile(myUID).then((result) => {
      if (result.success && result.data) setPotionCount(result.data.inventory?.potion ?? 0);
    });
  }, [myUID]);

  const [myReward, setMyReward] = useState<GameReward | null>(null);
  useEffect(() => {
    if (!gameState || gameState.gameStatus !== 'finished' || !myUID) return;
    const rank = (gameState.finishedOrder ?? []).indexOf(myUID) + 1;
    if (rank < 1 || rank > 3) return;
    if (gameState.rewardsClaimedBy?.includes(myUID)) return;
    void claimGameReward(roomKey, myUID, rank as 1 | 2 | 3).then((reward) => {
      if (reward) setMyReward(reward);
    });
  }, [gameState, myUID, roomKey]);

  // Win-streak/achievement — jalan buat SEMUA pemain (peringkat berapapun),
  // beda dari reward di atas yang cuma buat rank 1-3.
  useEffect(() => {
    if (!gameState || gameState.gameStatus !== 'finished' || !myUID) return;
    if (gameState.statsRecordedBy?.includes(myUID)) return;
    const rank = (gameState.finishedOrder ?? []).indexOf(myUID) + 1;
    const won = rank === 1;
    const durationMs = won && gameState.gameWonAt ? gameState.gameWonAt - gameState.gameCreatedAt : undefined;
    void recordMatchOutcome(roomKey, myUID, won, durationMs);
  }, [gameState, myUID, roomKey]);

  const pionPositionsRaw = gameState?.pionPositions ?? new Array(orderedPlayers.length).fill(0);
  const showQuestion = gameState?.showQuestion ?? false;
  const currentQuestion = gameState
    ? (gameState.questions?.[gameState.currentQuestionIndex] ?? null)
    : null;

  const playerListForUI = orderedPlayers.map((p, i) => {
    const hasValidPhoto = typeof p.photoURL === 'string' && p.photoURL.startsWith('http');
    const act = gameState?.playerActivity?.[p.uid];
    // isActive saja cukup untuk UI — timestamp check hanya di bot effect
    const isOffline = act ? !act.isActive : false;
    const finalAvatar = isOffline
      ? `https://api.dicebear.com/7.x/bottts/svg?seed=${p.uid}&backgroundColor=b6e3f4`
      : (hasValidPhoto ? p.photoURL : (PION_AVATARS[i] || ularTangga.pion1)) as string;
    return { id: i + 1, name: p.displayName || p.name || `Pemain ${i + 1}`, avatar: finalAvatar };
  });

  async function handleDiceRollStart(rolledNumber: number) {
    if ((!isMyTurn && !isBotActingRef.current) || !gameState || gameState.isMoving) return;
    await updateGameState(topicID, gameID, roomKey, {
      isMoving: true,
      diceState: {
        isRolling: true,
        currentNumber: rolledNumber,
        lastRoll: gameState.diceState?.lastRoll ?? null,
        rollingPlayerId: myUID ?? undefined,
      },
    });
  }

  // Guard per-client biar 1 turn cuma dieksekusi sekali dari sisi client ini
  // — kunci sebenarnya dari bug "timer bot yatim" di bawah: kalau effect-nya
  // re-run pas sequence roll-lalu-complete lagi jalan, inner setTimeout yang
  // gak sempet ke-clear bisa nembak handleDiceRollComplete lagi belakangan.
  // Dipisah roll vs answer (bukan 1 ref buat semuanya) karena satu turn yang
  // sama SAH punya 2 langkah (lempar dadu, lalu jawab soal tangga) — jangan
  // sampe langkah kedua ke-block gara-gara udah "kepake" sama langkah pertama.
  const actedRollTurnRef = useRef<number>(-1);
  const actedAnswerTurnRef = useRef<number>(-1);

  async function handleDiceRollComplete(rolledNumber: number) {
    if ((!isMyTurn && !isBotActingRef.current) || !gameState) return;
    if (gameState.isMoving) return;
    const turn = gameState.turnCounter ?? 0;
    if (actedRollTurnRef.current === turn) return;
    actedRollTurnRef.current = turn;
    const currentPos = gameState.pionPositions[gameState.currentPlayerIndex] ?? 0;
    // Pion yang belum masuk papan (posisi 0) butuh dadu 6 buat masuk ke kotak
    // 1 — dadunya BUKAN langkah jalan, jadi rawPos di sini gak boleh dihitung
    // currentPos+rolledNumber kayak biasa. Kotak 1 KEBETULAN pangkal tangga
    // (LADDERS[1]=60) — kalau isLadderStart/isSnakeHead dites di sini kayak
    // roll biasa, needsQuestion bakal true padahal movePawn (special-case
    // posisi 0) gak pernah munculin soal, jadi nextTurn() gak pernah
    // kepanggil, giliran macet permanen (guard actedRollTurnRef ngeblok
    // roll berikutnya). Roll masuk-papan SELALU dianggap "gak butuh soal",
    // baik yang berhasil (dapet 6) maupun yang gagal.
    const isEnteringRoll = currentPos === 0;
    const rawPos = isEnteringRoll
      ? (rolledNumber === 6 ? 1 : 0)
      : Math.min(currentPos + rolledNumber, 100);
    // movePawn returns final position (after snake slide if any) — kalau
    // finalPos>=100 pemain ini FINISH, tapi game belum tentu kelar (lihat
    // appendFinisher di service) jadi giliran tetep harus lanjut ke pemain
    // berikutnya; nextTurn() sendiri yang bakal ngelewatin pemain yg abis
    // finish. Satu-satunya alasan SKIP nextTurn() di sini adalah lagi
    // nunggu jawaban soal tangga (needsQuestion) — itu nextTurn()-nya
    // dipanggil belakangan dari handleSelectAnswer.
    await movePawn(topicID, gameID, roomKey, gameState.currentPlayerIndex, rolledNumber);
    const hitSnake = !isEnteringRoll && isSnakeHead(rawPos);
    const needsQuestion = !isEnteringRoll && !hitSnake && isLadderStart(rawPos) && (gameState.questions?.length ?? 0) > 0;
    if (!needsQuestion) {
      await nextTurn(topicID, gameID, roomKey);
    }
  }

  async function handleSelectAnswer(selectedIndex: number) {
    if ((!isMyTurn && !isBotActingRef.current) || !gameState) return;
    const turn = gameState.turnCounter ?? 0;
    if (actedAnswerTurnRef.current === turn) return;
    actedAnswerTurnRef.current = turn;
    await submitAnswer(topicID, gameID, roomKey, selectedIndex);
    // Ditrack di ref (bukan setTimeout lepas) — konsisten sama timer bot
    // lain di file ini, biar gak ada write nextTurn() nyusul kalau halaman
    // ini keburu unmount atau giliran udah maju lewat jalur lain.
    botTimersRef.current.advance = setTimeout(async () => {
      botTimersRef.current.advance = null;
      await nextTurn(topicID, gameID, roomKey);
    }, 2000);
  }

  async function handleUsePotion() {
    if (!myUID || !isMyTurn || !currentQuestion) return;
    const success = await consumePotion(myUID);
    if (!success) return;
    setPotionCount((count) => Math.max(0, count - 1));
    await handleSelectAnswer(currentQuestion.correctIndex);
  }

  // Batas 8 detik buat jawab — cuma dijalankan di client SI PEMAIN AKTIF
  // sendiri (lewat guard `isMyTurn` di dalam `handleSelectAnswer`), bukan
  // watchdog lintas-client kayak NusaCard, karena game ini udah punya
  // mekanisme terpisah buat pemain yang beneran OFFLINE (bot-takeover 60
  // detik di atas) — timer ini spesifik buat pemain yang MASIH ADA tapi
  // telat milih. Telat dianggap salah otomatis lewat `handleSelectAnswer`
  // yang sama persis (bukan tebakan acak), guard `actedAnswerTurnRef`
  // di dalamnya udah nyegah dobel-fire kalau kebetulan barusan dijawab manual.
  useEffect(() => {
    if (!gameState?.waitingForAnswer || !gameState?.showQuestion || !gameState?.questionShownAt) return;
    if (!isMyTurn || isBotActingNow || !currentQuestion) return;

    const deadline = gameState.questionShownAt + ANSWER_TIMEOUT_MS;
    const remaining = deadline - Date.now();
    const wrongIndex = currentQuestion.options.findIndex((_, i) => i !== currentQuestion.correctIndex);
    if (wrongIndex === -1) return;

    const timeout = setTimeout(() => {
      void handleSelectAnswer(wrongIndex);
    }, Math.max(0, remaining));
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState?.waitingForAnswer, gameState?.showQuestion, gameState?.questionShownAt, gameState?.turnCounter, isMyTurn, isBotActingNow]);

  // Ref biar skip lempar-dadu gak dobel-fire kalau effect ini re-run.
  const skippedRollTurnRef = useRef<number>(-1);

  // Batas 10 detik buat lempar dadu di giliran sendiri — gak nyala pas lagi
  // nunggu jawaban/nunjukin soal (jatah ANSWER_TIMEOUT_MS di atas) atau pas
  // dadu udah mulai jalan/pion lagi bergerak. Pola sama kayak timer jawaban:
  // cuma dijalankan di client SI PEMAIN AKTIF sendiri (pemain yang beneran
  // offline udah ditangani bot-takeover di bawah). Telat = nextTurn()
  // langsung TANPA movePawn — pion diam di tempat, giliran lewat, gak ada
  // penalti tambahan (murni skip).
  useEffect(() => {
    if (!gameStarted || !gameState || isPaused) return;
    if (gameState.isMoving || gameState.waitingForAnswer || gameState.showQuestion) return;
    if (gameState.diceState?.isRolling) return;
    if (!isMyTurn || isBotActingNow || !gameState.lastTurnChangeAt) return;

    const turn = gameState.turnCounter ?? 0;
    if (skippedRollTurnRef.current === turn) return;

    const deadline = gameState.lastTurnChangeAt + ROLL_TIMEOUT_MS;
    const remaining = deadline - Date.now();

    const timeout = setTimeout(() => {
      skippedRollTurnRef.current = turn;
      void nextTurn(topicID, gameID, roomKey);
    }, Math.max(0, remaining));
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    gameStarted,
    isPaused,
    gameState?.isMoving,
    gameState?.waitingForAnswer,
    gameState?.showQuestion,
    gameState?.diceState?.isRolling,
    gameState?.lastTurnChangeAt,
    gameState?.turnCounter,
    isMyTurn,
    isBotActingNow,
  ]);

  // Ref untuk mencegah bot melempar dadu berkali-kali pada giliran yang sama (saat pion sedang berjalan)
  const lastBotTurnRef = useRef<number>(-1);

  // Timer roll & jawab bot disimpan di ref (bukan `let` lokal di dalam
  // effect) — `handleDiceRollStart` NULIS `diceState.isRolling:true` ke
  // Firestore, yang bikin `gameState` berubah dan effect BOT TAKEOVER di
  // bawah re-run SEBELUM completeTimer (1.5s kemudian) sempet nembak.
  // Kalau completeTimer cuma variabel lokal yang di-clear di cleanup effect
  // (perilaku lama), re-run itu bakal nge-cancel completeTimer-nya SENDIRI
  // tiap kali — dadu keliatan jalan tapi handleDiceRollComplete gak pernah
  // kepanggil, giliran macet permanen. Nyimpen di ref biar timer selamat
  // dari re-render yang dipicu writenya sendiri; cuma di-clear pas giliran
  // BENERAN ganti (reset-effect di bawah) atau component unmount.
  const botTimersRef = useRef<{
    start: ReturnType<typeof setTimeout> | null;
    complete: ReturnType<typeof setTimeout> | null;
    answer: ReturnType<typeof setTimeout> | null;
    advance: ReturnType<typeof setTimeout> | null;
  }>({ start: null, complete: null, answer: null, advance: null });

  function clearBotTimers() {
    if (botTimersRef.current.start) clearTimeout(botTimersRef.current.start);
    if (botTimersRef.current.complete) clearTimeout(botTimersRef.current.complete);
    if (botTimersRef.current.answer) clearTimeout(botTimersRef.current.answer);
    if (botTimersRef.current.advance) clearTimeout(botTimersRef.current.advance);
  }

  // Reset ref ketika turnCounter berubah
  useEffect(() => {
    const currentTurn = gameState?.turnCounter || 0;
    if (lastBotTurnRef.current !== currentTurn) {
      lastBotTurnRef.current = -1;
      clearBotTimers();
      botTimersRef.current = { start: null, complete: null, answer: null, advance: null };
    }
  }, [gameState?.turnCounter]);

  // Bersihin semua timer bot yang masih ngantri kalau halaman ini di-unmount
  // (pindah room/keluar) — biar gak ada write basi nyusul setelah komponen mati.
  useEffect(() => {
    return () => {
      clearBotTimers();
    };
  }, []);

  // ── BOT TAKEOVER LOGIC ──────────────────────────────────────────────────
  // isBotActingNow dihitung di render (lihat deklarasinya di atas, dekat
  // isMyTurn) — dipakai langsung di sini, gak dihitung ulang, biar effect
  // ini & effect timer lain (roll/answer timeout) selalu liat nilai yang
  // sama-persis di commit yang sama.
  useEffect(() => {
    if (!gameStarted || !gameState || isPaused) return;
    if (!isBotActingNow) return;

    if (gameState.waitingForAnswer && gameState.showQuestion) {
      // Guard biar timer jawab gak dijadwal ulang tiap `gameState` berubah
      // (mis. heartbeat 30s) selagi masih nunggu 3 detik yang sama.
      if (botTimersRef.current.answer) return;
      botTimersRef.current.answer = setTimeout(() => {
        botTimersRef.current.answer = null;
        // Bot gak asal tebak rata 1/4 — condong jawab bener kayak manusia
        // yang emang ngerti soal, sisanya nyebar ke opsi salah (lihat
        // pickBotAnswerIndex).
        const optionsCount = currentQuestion?.options?.length ?? 4;
        handleSelectAnswer(pickBotAnswerIndex(currentQuestion?.correctIndex, optionsCount));
      }, 3000);
      return;
    }

    if (!gameState.diceState?.isRolling && !gameState.waitingForAnswer) {
      const currentTurnCount = gameState.turnCounter ?? 0;
      if (lastBotTurnRef.current === currentTurnCount || botTimersRef.current.start) return;
      botTimersRef.current.start = setTimeout(() => {
        botTimersRef.current.start = null;
        lastBotTurnRef.current = currentTurnCount;
        const randomDice = Math.floor(Math.random() * 6) + 1;
        handleDiceRollStart(randomDice);
        botTimersRef.current.complete = setTimeout(() => {
          botTimersRef.current.complete = null;
          handleDiceRollComplete(randomDice);
        }, 1500);
      }, 2000);
      return;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted, gameState, players, myUID, isPaused, isBotActingNow]);

  // ── AUTO-WIN SAAT TINGGAL 1 PEMAIN AKTIF ────────────────────────────────
  // Formula staleness sengaja disamain persis sama bot-takeover di atas.
  // Cuma client si pemain yang masih aktif yang bisa masuk kondisi ini
  // (browser pemain lain yang udah kabur gak lagi jalanin JS), jadi gak ada
  // race nulis bareng dari beberapa client.
  useEffect(() => {
    if (!gameStarted || !gameState || gameState.gameStatus !== 'playing' || !myUID) return;
    if (!gameState.playerUIDs || gameState.playerUIDs.length < 2) return;

    // Bot (role:'ai') SENGAJA di-seed "permanen stale" (lihat
    // initializeUlarTanggaGameState) biar bot-takeover langsung jalan dari
    // giliran pertama — tapi itu artinya bot gak akan PERNAH kehitung
    // "aktif" di sini. Kalau bot ikut dihitung, room [1 pemain asli + bot]
    // bakal keliatan "semua orang kabur" begitu game mulai, langsung
    // ke-auto-win padahal bot-nya emang masih sah main. Bot dikeluarin dulu
    // dari daftar sebelum ngitung siapa yang masih aktif.
    const realPlayerUIDs = gameState.playerUIDs.filter(
      (uid) => orderedPlayers.find((p) => p.uid === uid)?.role !== 'ai',
    );
    if (realPlayerUIDs.length < 2) return;

    const ts = Date.now();
    const activeUIDs = realPlayerUIDs.filter((uid) => {
      const act = gameState.playerActivity?.[uid];
      return act ? (act.isActive && ts - act.lastActivity <= 60000) : true;
    });

    if (activeUIDs.length === 1 && activeUIDs[0] === myUID) {
      checkAndFinalizeSoleSurvivor(topicID, gameID, roomKey);
    }
  }, [gameStarted, gameState, myUID, topicID, gameID, roomKey, orderedPlayers]);

  // ── Render Loading & Locked State ─────────────────────────────────────────
  if (isGameLocked) {
    return (
      <main className="relative min-h-screen w-full overflow-x-hidden flex items-center justify-center bg-[#59a87d]">
        <div className="flex flex-col items-center justify-center gap-6 p-8 bg-black/50 backdrop-blur-md rounded-2xl border-2 border-red-500 shadow-2xl max-w-lg text-center">
          <span className="text-6xl">🔒</span>
          <h2 className="font-bauhaus text-white text-3xl font-bold">Akses Ditolak</h2>
          <p className="text-gray-200 text-lg">Ada yang sedang bermain di room ini. Silakan tunggu hingga permainan selesai, atau bergabung dengan room lain.</p>
          <button
            onClick={() => router.push(`/room/${params?.gameID}/${params?.topicID}/${params?.roomID}`)}
            className="mt-4 px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-full transition-transform active:scale-95"
          >
            Kembali
          </button>
        </div>
      </main>
    );
  }

  if (loading) {
    return <Loader message="Memuat permainan Ular Tangga..." />;
  }

  // ── Render ───────────────────────────────────────────────────────────────
  // Lobby "RUANG X" (wood-themed) cuma ada satu tempat: halaman /room/...
  // Kalau gameStarted belum true di sini, arahkan balik — jangan render lobby
  // kedua yang beda desain (dulu ada UlarTanggaLobby di sini, sisa alur lama).
  if (!gameStarted) {
    router.replace(`/room/${gameID}/${topicID}/${roomID}`);
    return <Loader message="Memuat permainan Ular Tangga..." />;
  }

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden">
      {/* Overlay rotasi perangkat */}

      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-[#59a87d]">
        <GameBackground />
      </div>

      {/* Konten utama */}
      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start lg:items-center justify-center min-h-[100svh] pt-2 md:pt-4 lg:pt-8 pb-0 px-2 md:px-5 lg:px-8 w-full max-w-[1400px] mx-auto">
        {/* Tombol Back di dalam game (jika user ingin keluar dari game yang sedang berlangsung) */}
        <button
          onClick={() => router.push(`/lobby/${params?.topicID}/${params?.gameID}`)}
          className="absolute left-10 lg:left-7 top-7 z-50 text-white transition-transform hover:scale-110"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        {/* Setting Button */}
        <SettingButton onClick={() => setIsPaused(true)} />

        {/* Kiri — Board */}
        <div className="flex-1 w-full flex items-start justify-center z-20 mt-1 md:mt-2 lg:mt-0">
          <div className="w-full aspect-square max-w-[80vh] md:max-w-[75vh] lg:max-w-[80vh] ml-4 md:ml-12 lg:ml-4">
            {/* pos 0 = belum jalan (tray di luar papan, lihat Board.tsx), pos 1 =
                kotak 1 (index papan 0). Sebelumnya pos<=1 disamain jadi index 0
                buat keduanya — pion yang lempar dadu "1" di giliran pertama gak
                kelihatan jalan sama sekali karena desiredIndex-nya gak berubah
                dari kondisi belum-jalan. */}
            <Board
              pionPositionIndexes={pionPositionsRaw.map((pos) => (pos === 0 ? -1 : pos - 1))}
              tanggaUp={Object.entries(LADDERS).map(([start, end]) => ({start: Number(start), end: Number(end)}))}
              snakesDown={Object.entries(SNAKES).map(([start, end]) => ({start: Number(start), end: Number(end)}))}
              isCorrect={gameState?.isCorrect ?? false}
            />
          </div>
        </div>

        {/* Kanan — PlayerTurnBox + Dice */}
        <div className="flex-1 w-full flex flex-col justify-start lg:justify-center items-center h-full">
          <div className="w-full flex-col flex items-center max-w-[85vmin] md:max-w-[70vh] lg:max-w-[75vh]">
            <PlayerTurnBox
              players={playerListForUI}
              currentPlayerIndex={currentPlayerIndex}
              focusedPlayerIndex={currentPlayerIndex}
              focusedPlayerName={currentPlayer?.displayName ?? null}
              isMyTurn={isMyTurn}
              disabled={isDiceDisabled}
              diceState={gameState?.diceState}
              onDiceRollStart={handleDiceRollStart}
              onDiceRollComplete={handleDiceRollComplete}
              question={
                currentQuestion
                  ? {
                    text: currentQuestion.text || 'Memuat soal...',
                    options: currentQuestion.options || [],
                    selectedIndex: gameState?.selectedAnswerIndex,
                    isCorrectIndex: currentQuestion.correctIndex,
                    questionShownAt: gameState?.questionShownAt,
                  }
                  : null
              }
              showQuestion={showQuestion}
              onSelectAnswer={handleSelectAnswer}
              myPlayerId={myUID ?? undefined}
              potionCount={potionCount}
              onUsePotion={handleUsePotion}
              turnStartedAt={gameState?.lastTurnChangeAt}
            />
          </div>
        </div>

        {/* Pause Modal */}
        <PauseModal
          isOpen={isPaused}
          onClose={() => setIsPaused(false)}
        />

        {/* Win Modal — menang normal (kotak 100) atau menang karena tinggal
            satu pemain aktif, keduanya lewat gameStatus==='finished'. */}
        <WinModal
          isOpen={gameState?.gameStatus === 'finished'}
          winnerName={winnerName}
          isMe={!!myUID && winnerUID === myUID}
          myReward={myReward}
          onContinue={() => router.push(`/lobby/${topicID}/${gameID}`)}
          onPlayAgain={() => router.push(roomPath)}
        />
      </div>
    </main>
  );
}
