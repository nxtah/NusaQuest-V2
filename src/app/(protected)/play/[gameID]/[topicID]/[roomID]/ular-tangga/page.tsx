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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../../../../features/auth/hooks/useAuth';
import GameBackground from '../../../../../../../features/game-ular-tangga/components/GameBackground';
import Board from '../../../../../../../features/game-ular-tangga/components/Board';
import PlayerTurnBox from '../../../../../../../features/game-ular-tangga/components/PlayerTurnBox';
import { ularTangga } from '../../../../../../../assets/images/ular-tangga/cloudinaryAssets';
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
  type UlarTanggaGameState,
  type GamePlayer,
  type UlarTanggaQuestion,
} from '../../../../../../../features/game-ular-tangga/services/ular-tangga-game.service';
import { playerJoinRoom, playerLeaveRoom } from '../../../../../../../features/lobby/services/lobby.service';
import UlarTanggaLobby from '../../../../../../../features/game-ular-tangga/components/UlarTanggaLobby';

// ─── Posisi ULAR (kepala → buntut) sesuai foto papan ───────────────────────
const SNAKES_DOWN: { start: number; end: number }[] = [
  { start: 23, end: 2  },
  { start: 30, end: 9  },
  { start: 56, end: 39 },
  { start: 66, end: 44 },
  { start: 68, end: 14 },
  { start: 91, end: 49 },
  { start: 94, end: 67 },
  { start: 98, end: 79 },
];

// ─── Posisi TANGGA (bawah → atas) sesuai foto papan ─────────────────────────
const TANGGA_UP: { start: number; end: number }[] = [
  { start: 4,  end: 14 },
  { start: 9,  end: 31 },
  { start: 20, end: 38 },
  { start: 28, end: 84 },
  { start: 40, end: 59 },
  { start: 51, end: 67 },
  { start: 63, end: 81 },
  { start: 71, end: 91 },
  { start: 80, end: 100 },
];

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

  const gameID  = params?.gameID  as string;
  const topicID = params?.topicID as string;
  const roomID  = params?.roomID  as string;

  // ── Auth ─────────────────────────────────────────────────────────────────
  const { user } = useAuth();
  const myUID = user?.uid ?? null;

  // ── State ────────────────────────────────────────────────────────────────
  const [players,   setPlayers]   = useState<GamePlayer[]>([]);
  const [gameState, setGameState] = useState<UlarTanggaGameState | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [isPaused,  setIsPaused]  = useState(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [isGameLocked, setIsGameLocked] = useState<boolean>(false);

  const gameStartedRef = useRef<boolean>(false);
  useEffect(() => {
    gameStartedRef.current = gameStarted;
  }, [gameStarted]);

  const activityTimerRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestPlayersRef      = useRef<GamePlayer[]>([]);

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
           playerLeaveRoom(topicID, gameID, roomID, user.uid).catch(() => {});
         } else {
           setPlayerOffline(topicID, gameID, roomID, user.uid).catch(() => {});
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
      const shuffled  = shuffle<UlarTanggaQuestion>(questions);

      // Tetapkan index pemain berdasarkan urutan mereka masuk ke array
      const indexedPlayers = players.map((p, i) => ({ ...p, playerIndex: i }));

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

      if (state.gameStatus === 'finished' || state.gameStatus === 'abandoned') {
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
  const currentPlayer      = players[currentPlayerIndex];
  const isMyTurn           = !!myUID && currentPlayer?.uid === myUID;

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
  // pionPositions dalam Firebase: 1-indexed (1–100). 0 berarti belum di papan.
  // Kita kirim ke Board sebagai 0-indexed (0–99), atau -1 jika belum masuk papan.
  // Ubah nilai default ke 1 agar pion langsung tampil di papan kotak pertama.
  const pionPositionsRaw = gameState?.pionPositions ?? new Array(players.length).fill(1);
  const showQuestion       = gameState?.showQuestion   ?? false;
  const currentQuestion    = gameState
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
      id:     i + 1,
      name:   p.displayName || p.name || `Pemain ${i + 1}`,
      avatar: finalAvatar,
    };
  });

  // ── Handler: Saat dice diklik (mulai animasi) ────────────────────────────
  const handleDiceRollStart = useCallback(
    async (rolledNumber: number) => {
      if ((!isMyTurn && !isBotActing) || !gameState) return;

      await updateGameState(topicID, gameID, roomID, {
        diceState: {
          isRolling:     true,
          currentNumber: rolledNumber,
          lastRoll:      gameState.diceState?.lastRoll ?? null,
        },
      });
    },
    [isMyTurn, gameState, topicID, gameID, roomID],
  );

  // ── Handler: Setelah dice selesai animasi ────────────────────────────────
  const handleDiceRollComplete = useCallback(
    async (rolledNumber: number, _isUserAction: boolean) => {
      if ((!isMyTurn && !isBotActing) || !gameState) return;

      const currentPositions = [...(gameState.pionPositions ?? [])];
      const startPosition = currentPositions[currentPlayerIndex] ?? 0;
      let intermediatePosition = startPosition + rolledNumber;

      // Jika melebihi 100, tidak jadi jalan
      if (intermediatePosition > BOARD_SIZE) {
        intermediatePosition = startPosition;
      }

      // MATIKAN SEMENTARA SESUAI REQUEST
      const tanggaMatch = undefined; // TANGGA_UP.find((t) => t.start === intermediatePosition);
      const snakeMatch = undefined; // SNAKES_DOWN.find((s) => s.start === intermediatePosition);
      const finalPosition = intermediatePosition; // tanggaMatch ? tanggaMatch.end : (snakeMatch ? snakeMatch.end : intermediatePosition);

      // 1. Posisikan ke angka dadu terlebih dahulu agar pion berjalan langkah demi langkah
      currentPositions[currentPlayerIndex] = intermediatePosition;

      await updateGameState(topicID, gameID, roomID, {
        pionPositions: [...currentPositions],
        diceState: {
          isRolling:     false,
          currentNumber: rolledNumber,
          lastRoll:      rolledNumber,
        },
      });

      // Hitung durasi jalan pion: tiap kotak = 0.18 + 0.14 = 0.32 detik
      const stepsToWalk = Math.abs(intermediatePosition - startPosition);
      const walkDurationMs = stepsToWalk > 0 ? stepsToWalk * 320 + 200 : 500;

      // 2. Tunggu animasi berjalan selesai, lalu eksekusi ular/tangga & pertanyaan
      setTimeout(async () => {
        const nextPositions = [...currentPositions];
        nextPositions[currentPlayerIndex] = finalPosition;

        const hasJump = finalPosition !== intermediatePosition;

        // Jika ada lompatan (ular/tangga), update posisi dulu agar meluncur
        if (hasJump) {
          await updateGameState(topicID, gameID, roomID, {
            pionPositions: [...nextPositions],
          });
        }

        const finishGameIfDone = async () => {
          if (finalPosition >= BOARD_SIZE) {
            await updateGameState(topicID, gameID, roomID, {
              pionPositions:         nextPositions,
              gameStatus:            'finished',
              gameWinnerUID:         currentPlayer?.uid,
              gameWinnerDisplayName: currentPlayer?.displayName,
              gameWonAt:             Date.now(),
            });
            await cleanupGame(topicID, gameID, roomID);
            router.push(`/lobby/${topicID}/${gameID}`);
            return true;
          }
          return false;
        };

        const showQuestionLogic = async () => {
          // MATIKAN PERTANYAAN SEMENTARA SESUAI REQUEST (karena ular/tangga dimatikan)
          const shouldShowQuestion = false; // Boolean(gameState.questions && gameState.questions.length > 0);
          const nextQuestionIndex  = shouldShowQuestion
            ? (gameState.currentQuestionIndex + 1) % (gameState.questions?.length || 1)
            : 0;

          // Aturan Ular Tangga: Dapat 6 = Jalan Lagi!
          const nextPlayerIndex = rolledNumber === 6
            ? currentPlayerIndex
            : (currentPlayerIndex + 1) % Math.max(players.length, 1);

          await updateGameState(topicID, gameID, roomID, {
            pionPositions:        nextPositions,
            showQuestion:         shouldShowQuestion,
            waitingForAnswer:     shouldShowQuestion,
            currentQuestionIndex: shouldShowQuestion ? nextQuestionIndex : gameState.currentQuestionIndex,
            turnCounter:          (gameState.turnCounter || 0) + 1,
            ...(shouldShowQuestion ? {} : { currentPlayerIndex: nextPlayerIndex }),
          });
        };

        // Tunggu animasi meluncur (1.2 detik) jika ada ular/tangga, baru munculkan pertanyaan
        if (hasJump) {
          setTimeout(async () => {
            if (await finishGameIfDone()) return;
            await showQuestionLogic();
          }, 1300);
        } else {
          if (await finishGameIfDone()) return;
          await showQuestionLogic();
        }

      }, walkDurationMs);
    },
    [isMyTurn, gameState, currentPlayerIndex, currentPlayer, topicID, gameID, roomID, router],
  );

  // ── Handler: Jawab soal ───────────────────────────────────────────────────
  const handleSelectAnswer = useCallback(
    async (selectedIndex: number) => {
      if ((!isMyTurn && !isBotActing) || !gameState || !currentQuestion) return;

      const isCorrect = selectedIndex === currentQuestion.correctIndex;
      
      // Jika sebelumnya dia dapat dadu 6, giliran tetap miliknya setelah menjawab!
      const isExtraTurn = gameState.diceState?.currentNumber === 6;
      const nextPlayerIndex = isExtraTurn
        ? currentPlayerIndex
        : (currentPlayerIndex + 1) % Math.max(players.length, 1);

      await updateGameState(topicID, gameID, roomID, {
        showQuestion:       false,
        waitingForAnswer:   false,
        isCorrect,
        currentPlayerIndex: nextPlayerIndex,
        turnCounter:        (gameState.turnCounter || 0) + 1,
        diceState: {
          isRolling:     false,
          currentNumber: gameState.diceState?.currentNumber ?? 1,
          lastRoll:      gameState.diceState?.lastRoll ?? null,
        },
      });
    },
    [isMyTurn, isBotActing, gameState, currentQuestion, currentPlayerIndex, players.length, topicID, gameID, roomID],
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
          <h2 className="text-white text-3xl font-bold" style={{ fontFamily: 'var(--font-spicy-rice)' }}>Akses Ditolak</h2>
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
              pionPositionIndexes={pionPositionsRaw.map((pos) => (pos <= 0 ? -1 : pos - 1))}
              tanggaUp={TANGGA_UP}
              snakesDown={SNAKES_DOWN}
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
              diceState={gameState?.diceState}
              onDiceRollStart={handleDiceRollStart}
              onDiceRollComplete={handleDiceRollComplete}
              question={
                currentQuestion
                  ? {
                      text:    currentQuestion.text,
                      options: currentQuestion.options,
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
