"use client";

/**
 * @file page.tsx (Ular Tangga)
 * @description Halaman game Ular Tangga yang terhubung ke Firebase RTDB.
 * Semua data game (state, pemain, soal) dibaca dan ditulis ke database.
 *
 * CATATAN TESTING: Jika tidak ada pemain di Firebase (akses URL langsung),
 * sistem akan otomatis menggunakan user yang sedang login sebagai pemain,
 * sehingga game bisa langsung dimainkan tanpa harus melalui lobby.
 */

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useRouter, useParams} from 'next/navigation';
import {useAuth} from '../../../../../../../features/auth/hooks/useAuth';
import GameBackground from '../../../../../../../features/game-ular-tangga/components/GameBackground';
import Board from '../../../../../../../features/game-ular-tangga/components/Board';
import PlayerTurnBox from '../../../../../../../features/game-ular-tangga/components/PlayerTurnBox';
import {ularTangga} from '../../../../../../../assets/images/ular-tangga/cloudinaryAssets';
import RotateDeviceOverlay from '../../../../../../../components/layout/RotateDeviceOverlay';
import PauseModal from '../../../../../../../features/game-ular-tangga/components/PauseModal';
import SettingButton from '../../../../../../../features/game-ular-tangga/components/SettingButton';

import {
  fetchGamePlayers,
  getQuestions,
  shuffle,
  initializeUlarTanggaGameState,
  listenToGameState,
  listenToGameStart,
  updateGameState,
  setGameStartStatus,
  setGameStatus,
  cleanupGame,
  updatePlayerActivity,
  setPlayerOffline,
  movePawn,
  submitAnswer,
  nextTurn,
  type UlarTanggaGameState,
  type GamePlayer,
  type UlarTanggaQuestion,
} from '../../../../../../../features/game-ular-tangga/services/ular-tangga-game.service';
import {playerJoinRoom, playerLeaveRoom} from '../../../../../../../features/lobby/services/lobby.service';
import UlarTanggaLobby from '../../../../../../../features/game-ular-tangga/components/UlarTanggaLobby';
import {LADDERS} from '../../../../../../../features/game-ular-tangga/utils/board-rules';

// Data tangga dan ular sekarang dikelola oleh board-rules.ts dan service layer.

// ─── Avatar pion per index ──────────────────────────────────────────────────
const PION_AVATARS = [
  ularTangga.pion1,
  ularTangga.pion2,
  ularTangga.pion3,
  ularTangga.pion4,
];

// ─── Timeout tunggu data pemain dari Firebase ───────────────────────────────
// Jika dalam 3 detik tidak ada pemain di Firebase, gunakan user saat ini
const PLAYERS_WAIT_TIMEOUT_MS = 3000;

const BOARD_SIZE = 100;
const ACTIVITY_INTERVAL_MS = 30_000;

export default function UlarTanggaPage() {
  const router = useRouter();
  const params = useParams();

  const gameID = params?.gameID as string;
  const topicID = params?.topicID as string;
  const roomID = params?.roomID as string;

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

  // ── Langkah 1: Subscribe ke pemain Firebase & Auto Join ───────────
  useEffect(() => {
    if (!topicID || !gameID || !roomID || !user) return;

    let isJoined = false;

    const joinRoom = async () => {
      try {
        await playerJoinRoom(
          topicID,
          gameID,
          roomID,
          user.uid,
          user.displayName || 'Pemain',
          user.googlePhotoURL || user.firebasePhotoURL || undefined
        );
        isJoined = true;
      } catch (error: any) {
        if (error.message === 'Permainan sedang berlangsung') {
          setIsGameLocked(true);
          setLoading(false);
        } else if (error.message === 'Room penuh') {
          console.warn('Room penuh');
        }
      }
    };
    joinRoom();

    const unsub = fetchGamePlayers(topicID, gameID, roomID, (fetchedPlayers) => {
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
          playerLeaveRoom(topicID, gameID, roomID, user.uid).catch(() => { });
        } else {
          setPlayerOffline(topicID, gameID, roomID, user.uid).catch(() => { });
        }
      }
    };
  }, [topicID, gameID, roomID, user]);

  // ── Subscribe ke status Game Started ─────────────────────────────
  useEffect(() => {
    if (!topicID || !gameID || !roomID) return;
    const unsub = listenToGameStart(topicID, gameID, roomID, (isStarted) => {
      setGameStarted(isStarted);
      if (!isStarted) {
        setLoading(false); // Sudah masuk lobby, berhenti loading
      }
    });
    return () => unsub();
  }, [topicID, gameID, roomID]);

  // ── Langkah 2: Bootstrap game state di Firebase (reset + init baru) ────────
  // ── Handler: Saat tombol Mulai Permainan ditekan ──────────────
  const handleStartGame = async () => {
    if (players.length === 0) return;

    setLoading(true);
    try {
      // Hapus state lama (jika ada) agar fresh
      await cleanupGame(topicID, gameID, roomID);

      const questions = await getQuestions(topicID);
      if (questions.length === 0) {
        alert(`Peringatan: Tidak ada soal ditemukan untuk topik "${topicID}". Game akan berjalan tanpa tantangan tangga.`);
      }
      const shuffled = shuffle<UlarTanggaQuestion>(questions);

      // Tetapkan index pemain berdasarkan urutan mereka masuk ke array
      const indexedPlayers = players.map((p, i) => ({...p, playerIndex: i}));

      // Init game state baru (termasuk mapping pion)
      await initializeUlarTanggaGameState(topicID, gameID, roomID, indexedPlayers, shuffled);
      await setGameStatus(topicID, gameID, roomID, 'playing');

      // Trigger semua client untuk berpindah ke board game
      await setGameStartStatus(topicID, gameID, roomID, true);
    } catch (err) {
      console.error('Gagal bootstrap game Ular Tangga:', err);
      setLoading(false);
    }
  };

  // ── Langkah 3: Subscribe ke gameState Firebase (real-time) ───────────────
  useEffect(() => {
    if (!topicID || !gameID || !roomID || !gameStarted) return;

    const unsub = listenToGameState(topicID, gameID, roomID, (state) => {
      setGameState(state);
      setLoading(false);

      if (state.gameStatus === 'finished') {
        router.push('/');
      } else if (state.gameStatus === 'abandoned') {
        router.push(`/lobby/${topicID}/${gameID}`);
      }
    });

    return () => unsub();
  }, [topicID, gameID, roomID, gameStarted, router]);

  // ── Update aktivitas pemain secara berkala + auto-cleanup saat keluar ──────
  useEffect(() => {
    if (!myUID || !topicID || !gameID || !roomID || !gameStarted) return;

    updatePlayerActivity(topicID, gameID, roomID, myUID);

    activityTimerRef.current = setInterval(() => {
      updatePlayerActivity(topicID, gameID, roomID, myUID);
    }, ACTIVITY_INTERVAL_MS);

    return () => {
      if (activityTimerRef.current) clearInterval(activityTimerRef.current);
    };
  }, [myUID, topicID, gameID, roomID, gameStarted]);

  // ── Computed values ──────────────────────────────────────────────────────
  const currentPlayerIndex = gameState?.currentPlayerIndex ?? 0;
  const currentPlayer = players[currentPlayerIndex];
  const isMyTurn = !!myUID && currentPlayer?.uid === myUID;
  const isDiceDisabled = (() => {
    if (!gameState) {
      return true;
    } else if (gameState.isMoving) {
      return true;
    } else if (gameState.waitingForAnswer) {
      return true;
    } else if (gameState.showQuestion) {
      return true;
    } else {
      return false;
    }
  })();

  // Variabel untuk Bot Takeover
  const currentActivePlayerUID = currentPlayer?.uid;
  const currentActivity = currentActivePlayerUID ? gameState?.playerActivity?.[currentActivePlayerUID] : null;
  // Jika offline lebih dari 60 detik atau isActive false
  const isCurrentPlayerOffline = currentActivity ? (!currentActivity.isActive || (Date.now() - currentActivity.lastActivity > 60000)) : false;

  // Mencari siapa yang harus menjadi 'Otak' Bot (Bot Runner).
  // Bot Runner adalah pemain pertama di daftar yang statusnya masih ONLINE.
  const firstOnlinePlayer = players.find(p => {
    const act = gameState?.playerActivity?.[p.uid];
    return act ? (act.isActive && (Date.now() - act.lastActivity <= 60000)) : true;
  });
  const isMeBotRunner = firstOnlinePlayer?.uid === myUID;
  const isBotActing = isMeBotRunner && isCurrentPlayerOffline && !isMyTurn;
  // pionPositions dalam Firebase: 1-indexed (1–100). 0 berarti belum di papan (Start).
  // Kita kirim ke Board sebagai 0-indexed (0–99), atau -1 jika belum masuk papan.
  // Set default ke 0 agar pemain bisa mendarat di kotak 1.
  const pionPositionsRaw = gameState?.pionPositions ?? new Array(players.length).fill(0);
  const showQuestion = gameState?.showQuestion ?? false;
  const currentQuestion = gameState
    ? (gameState.questions?.[gameState.currentQuestionIndex] ?? null)
    : null;

  const playerListForUI = players.map((p, i) => {
    const hasValidPhoto = typeof p.photoURL === 'string' && p.photoURL.startsWith('http');

    // Check if player is offline
    const activity = gameState?.playerActivity?.[p.uid];
    const isOffline = activity ? (!activity.isActive || (Date.now() - activity.lastActivity > 60000)) : false;

    // Gunakan avatar robot dari DiceBear jika offline
    const finalAvatar = isOffline
      ? `https://api.dicebear.com/7.x/bottts/svg?seed=${p.uid}&backgroundColor=b6e3f4`
      : (hasValidPhoto ? p.photoURL : (PION_AVATARS[i] || ularTangga.pion1)) as string;

    return {
      id: i + 1,
      name: p.displayName || p.name || `Pemain ${i + 1}`,
      avatar: finalAvatar,
    };
  });

  // ── Handler: Saat dice diklik (mulai animasi) ────────────────────────────
  const handleDiceRollStart = useCallback(
    async (rolledNumber: number) => {
      if ((!isMyTurn && !isBotActing) || !gameState || gameState.isMoving) return;

      await updateGameState(topicID, gameID, roomID, {
        isMoving: true,
        diceState: {
          isRolling: true,
          currentNumber: rolledNumber,
          lastRoll: gameState.diceState?.lastRoll ?? null,
          rollingPlayerId: myUID ?? undefined,
        },
      });
    },
    [isMyTurn, isBotActing, gameState, topicID, gameID, roomID],
  );

  // ── Handler: Setelah dice selesai animasi ────────────────────────────────
  const handleDiceRollComplete = useCallback(
    async (rolledNumber: number, _isUserAction?: boolean) => {
      if ((!isMyTurn && !isBotActing) || !gameState) return;

      if (gameState.isMoving) {
        console.warn('[HANDLER] Blocked complete while move lock is active');
        return;
      }

      console.log(`[HANDLER] DiceRollComplete called:`, {
        rolledNumber,
        currentPlayerIndex: gameState.currentPlayerIndex,
        currentPlayerUID: gameState.currentPlayerUID,
        myUID,
        isMyTurn,
        isBotActing,
      });

      // Panggil movePawn dengan userUID untuk validasi UID-based
      await movePawn(topicID, gameID, roomID, gameState.currentPlayerIndex, rolledNumber, myUID);
    },
    [isMyTurn, isBotActing, gameState, topicID, gameID, roomID, myUID],
  );

  // ── Handler: Jawab soal ───────────────────────────────────────────────────
  const handleSelectAnswer = useCallback(
    async (selectedIndex: number) => {
      if ((!isMyTurn && !isBotActing) || !gameState) return;
      // ===== PERBAIKI: Pass myUID untuk validasi UID =====
      await submitAnswer(topicID, gameID, roomID, selectedIndex, myUID || '');

      // Delay 2 detik agar user bisa melihat highlight sebelum ganti turn
      setTimeout(async () => {
        await nextTurn(topicID, gameID, roomID);
      }, 2000);
    },
    [isMyTurn, isBotActing, gameState, topicID, gameID, roomID, myUID],
  );

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
    if (!gameStarted || !gameState || !isBotActing || isPaused) return;

    // 1. Jika sedang menunggu jawaban soal
    if (gameState.waitingForAnswer && gameState.showQuestion) {
      const timer = setTimeout(() => {
        // Jawab secara acak (0-3)
        const randomAnswer = Math.floor(Math.random() * 4);
        handleSelectAnswer(randomAnswer);
      }, 3000);
      return () => clearTimeout(timer);
    }

    // 2. Jika waktunya roll dadu (belum rolling dan tidak sedang ditanya)
    if (!gameState.diceState?.isRolling && !gameState.waitingForAnswer) {
      const currentTurnCount = gameState.turnCounter || 0;
      if (lastBotTurnRef.current === currentTurnCount) return; // Mencegah double roll saat animasi berjalan

      const timer = setTimeout(() => {
        lastBotTurnRef.current = currentTurnCount; // Tandai bahwa bot sudah jalan di giliran ini
        const randomDice = Math.floor(Math.random() * 6) + 1;
        // Panggil start lalu complete dengan delay sedikit agar UI terlihat
        handleDiceRollStart(randomDice);
        setTimeout(() => {
          handleDiceRollComplete(randomDice, false);
        }, 1500); // Sesuaikan dengan durasi animasi dadu
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameStarted, gameState, isBotActing, isPaused, handleSelectAnswer, handleDiceRollStart, handleDiceRollComplete]);

  // ── Render Loading & Locked State ─────────────────────────────────────────
  if (isGameLocked) {
    return (
      <main className="relative min-h-screen w-full overflow-x-hidden flex items-center justify-center bg-[#59a87d]">
        <div className="flex flex-col items-center justify-center gap-6 p-8 bg-black/50 backdrop-blur-md rounded-2xl border-2 border-red-500 shadow-2xl max-w-lg text-center">
          <span className="text-6xl">🔒</span>
          <h2 className="text-white text-3xl font-bold" style={{fontFamily: 'var(--font-spicy-rice)'}}>Akses Ditolak</h2>
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
    return (
      <main className="relative min-h-screen w-full overflow-x-hidden flex items-center justify-center bg-[#59a87d]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-white text-xl font-semibold">
            Memuat permainan Ular Tangga...
          </p>
        </div>
      </main>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  if (!gameStarted) {
    return (
      <main className="relative min-h-screen w-full overflow-x-hidden">
        {/* Overlay rotasi perangkat */}
        <RotateDeviceOverlay />
        <UlarTanggaLobby
          players={players}
          onStartGame={handleStartGame}
          topicID={topicID}
          roomID={roomID}
          myUID={myUID}
        />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden">
      {/* Overlay rotasi perangkat */}
      <RotateDeviceOverlay />

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
