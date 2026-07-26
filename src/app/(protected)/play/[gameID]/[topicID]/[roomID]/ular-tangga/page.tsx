"use client";


import React, {useEffect, useRef, useState} from 'react';
import {useRouter, useParams} from 'next/navigation';

import GameBackground from '@/src/features/game-ular-tangga/components/GameBackground';
import Board from '@/src/features/game-ular-tangga/components/Board';
import PlayerTurnBox from '@/src/features/game-ular-tangga/components/PlayerTurnBox';
import {ularTangga} from '@/src/assets/images/ular-tangga/cloudinaryAssets';
import PauseModal from '@/src/components/layout/PauseModal';
import Loader from '@/src/components/ui/Loader';
import SettingButton from '@/src/components/layout/SettingButton';
import {useAuth} from '@/src/features/auth/hooks/useAuth';

import {
  fetchGamePlayers,
  listenToGameState,
  listenToGameStart,
  updateGameState,
  updatePlayerActivity,
  setPlayerOffline,
  movePawn,
  submitAnswer,
  nextTurn,
  type UlarTanggaGameState,
  type GamePlayer,
} from '@/src/features/game-ular-tangga/services/ular-tangga-game.service';
import {playerJoinRoom, playerLeaveRoom} from '@/src/features/lobby/services/lobby.service';
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
      if (state.gameStatus === 'finished') {
        router.push('/');
      } else if (state.gameStatus === 'abandoned') {
        router.push(`/lobby/${topicID}/${gameID}`);
      }
    });

    return () => unsub();
  }, [topicID, gameID, roomKey, gameStarted, router]);

  // ── Update aktivitas pemain secara berkala + auto-cleanup saat keluar ──────
  useEffect(() => {
    if (!myUID || !topicID || !gameID || !roomID || !gameStarted) return;

    updatePlayerActivity(topicID, gameID, roomKey, myUID);

    activityTimerRef.current = setInterval(() => {
      updatePlayerActivity(topicID, gameID, roomKey, myUID);
    }, ACTIVITY_INTERVAL_MS);

    return () => {
      if (activityTimerRef.current) clearInterval(activityTimerRef.current);
    };
  }, [myUID, topicID, gameID, roomKey, gameStarted]);


  // ── Computed values ──────────────────────────────────────────────────────
  // Urutkan players berdasarkan playerUIDs dari gameState agar index konsisten
  // meski Firestore Object.entries() berubah urutan saat player baru join.
  const orderedPlayers = gameState?.playerUIDs?.length
    ? gameState.playerUIDs
        .map((uid) => players.find((p) => p.uid === uid))
        .filter((p): p is GamePlayer => !!p)
    : players;

  const currentPlayerIndex = gameState?.currentPlayerIndex ?? 0;
  // Pakai currentPlayerUID dari Firestore — tidak bergantung urutan array lokal.
  const currentPlayerUID = gameState?.currentPlayerUID ?? orderedPlayers[currentPlayerIndex]?.uid;
  const currentPlayer = orderedPlayers.find((p) => p.uid === currentPlayerUID) ?? orderedPlayers[currentPlayerIndex];
  const isMyTurn = !!myUID && currentPlayerUID === myUID;
  const isDiceDisabled = !gameState || gameState.isMoving || gameState.waitingForAnswer || gameState.showQuestion;
  // isBotActing dihitung langsung di handler & bot effect — tidak di render path.
  const isBotActingRef = useRef(false);

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

  async function handleDiceRollComplete(rolledNumber: number) {
    if ((!isMyTurn && !isBotActingRef.current) || !gameState) return;
    if (gameState.isMoving) return;
    const currentPos = gameState.pionPositions[gameState.currentPlayerIndex] ?? 0;
    const rawPos = Math.min(currentPos + rolledNumber, 100);
    // movePawn returns final position (after snake slide if any)
    const finalPos = await movePawn(topicID, gameID, roomKey, gameState.currentPlayerIndex, rolledNumber);
    const isWin = finalPos >= 100;
    const hitSnake = isSnakeHead(rawPos);
    const needsQuestion = !hitSnake && isLadderStart(rawPos) && (gameState.questions?.length ?? 0) > 0;
    if (!isWin && !needsQuestion) {
      await nextTurn(topicID, gameID, roomKey);
    }
  }

  async function handleSelectAnswer(selectedIndex: number) {
    if ((!isMyTurn && !isBotActingRef.current) || !gameState) return;
    await submitAnswer(topicID, gameID, roomKey, selectedIndex);
    setTimeout(async () => {
      await nextTurn(topicID, gameID, roomKey);
    }, 2000);
  }

  // Ref untuk mencegah bot melempar dadu berkali-kali pada giliran yang sama (saat pion sedang berjalan)
  const lastBotTurnRef = useRef<number>(-1);

  // Reset ref ketika turnCounter berubah
  useEffect(() => {
    const currentTurn = gameState?.turnCounter || 0;
    if (lastBotTurnRef.current !== currentTurn) {
      lastBotTurnRef.current = -1;
    }
  }, [gameState?.turnCounter]);

  // ── BOT TAKEOVER LOGIC ──────────────────────────────────────────────────
  useEffect(() => {
    if (!gameStarted || !gameState || isPaused) return;

    // Hitung isBotActing di dalam effect — Date.now() tidak masalah di effect.
    const ts = Date.now();
    const currentUID = gameState.currentPlayerUID ?? orderedPlayers[gameState.currentPlayerIndex]?.uid;
    const activity = currentUID ? gameState.playerActivity?.[currentUID] : null;
    const offline = activity ? (!activity.isActive || ts - activity.lastActivity > 60000) : false;
    const myTurn = !!myUID && currentUID === myUID;
    let botActing = false;
    if (offline && !myTurn) {
      const first = orderedPlayers.find(p => {
        const act = gameState.playerActivity?.[p.uid];
        return act ? (act.isActive && ts - act.lastActivity <= 60000) : true;
      });
      botActing = first?.uid === myUID;
    }
    isBotActingRef.current = botActing;
    if (!botActing) return;

    if (gameState.waitingForAnswer && gameState.showQuestion) {
      const timer = setTimeout(() => {
        handleSelectAnswer(Math.floor(Math.random() * 4));
      }, 3000);
      return () => clearTimeout(timer);
    }

    if (!gameState.diceState?.isRolling && !gameState.waitingForAnswer) {
      const currentTurnCount = gameState.turnCounter ?? 0;
      if (lastBotTurnRef.current === currentTurnCount) return;
      const timer = setTimeout(() => {
        lastBotTurnRef.current = currentTurnCount;
        const randomDice = Math.floor(Math.random() * 6) + 1;
        handleDiceRollStart(randomDice);
        setTimeout(() => { handleDiceRollComplete(randomDice); }, 1500);
      }, 2000);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted, gameState, players, myUID, isPaused]);

  // ── Render Loading & Locked State ─────────────────────────────────────────
  if (isGameLocked) {
    return (
      <main className="relative min-h-screen w-full overflow-x-hidden flex items-center justify-center bg-[#59a87d]">
        <div className="flex flex-col items-center justify-center gap-6 p-8 bg-black/50 backdrop-blur-md rounded-2xl border-2 border-red-500 shadow-2xl max-w-lg text-center">
          <span className="text-6xl">🔒</span>
          <h2 className="text-white text-3xl font-bold" style={{fontFamily: 'var(--font-bauhaus)'}}>Akses Ditolak</h2>
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
            <Board
              pionPositionIndexes={pionPositionsRaw.map((pos) => (pos <= 1 ? 0 : pos - 1))}
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
                  }
                  : null
              }
              showQuestion={showQuestion}
              onSelectAnswer={handleSelectAnswer}
              myPlayerId={myUID ?? undefined}
            />
          </div>
        </div>

        {/* Pause Modal */}
        <PauseModal
          isOpen={isPaused}
          onClose={() => setIsPaused(false)}
        />
      </div>
    </main>
  );
}
