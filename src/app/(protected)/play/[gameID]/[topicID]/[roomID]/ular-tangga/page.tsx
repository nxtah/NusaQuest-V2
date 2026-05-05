"use client";

/**
 * @file page.tsx (Ular Tangga)
 * @description Halaman game Ular Tangga yang terhubung ke Firebase RTDB.
 * Semua data game (state, pemain, soal) dibaca dan ditulis ke database,
 * bukan hanya disimpan di local state — sesuai dengan arsitektur V1.
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
  updateGameState,
  setGameStatus,
  cleanupGame,
  updatePlayerActivity,
  type UlarTanggaGameState,
  type GamePlayer,
  type UlarTanggaQuestion,
} from '../../../../../../../features/game-ular-tangga/services/ular-tangga-game.service';

// ─── Definisi posisi ular dan tangga (sesuai visual Board) ─────────────────
// Ular: posisi board 1-100, turun dari start ke end
const SNAKES_DOWN: { start: number; end: number }[] = [
  { start: 17, end: 7 },
  { start: 54, end: 34 },
  { start: 62, end: 19 },
  { start: 64, end: 60 },
  { start: 87, end: 24 },
  { start: 93, end: 73 },
  { start: 95, end: 75 },
  { start: 99, end: 78 },
];

// Tangga: posisi board 1-100, naik dari start ke end
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

// ─── Konstanta ──────────────────────────────────────────────────────────────
const BOARD_SIZE = 100;
const ACTIVITY_INTERVAL_MS = 30_000; // Update aktivitas setiap 30 detik

export default function UlarTanggaPage() {
  const router = useRouter();
  const params = useParams();

  const gameID  = params?.gameID  as string;
  const topicID = params?.topicID as string;
  const roomID  = params?.roomID  as string;

  // ── State ────────────────────────────────────────────────────────────────
  const [players,   setPlayers]   = useState<GamePlayer[]>([]);
  const [gameState, setGameState] = useState<UlarTanggaGameState | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [isPaused,  setIsPaused]  = useState(false);
  const [initDone,  setInitDone]  = useState(false);

  const activityTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Baca UID user yang sedang login via AuthContext ───────────────────────
  const { user } = useAuth();
  const myUID = user?.uid ?? null;

  // ── Langkah 1: Subscribe ke data pemain dari Firebase ───────────────────
  useEffect(() => {
    if (!topicID || !gameID || !roomID) return;

    const unsub = fetchGamePlayers(topicID, gameID, roomID, (fetchedPlayers) => {
      setPlayers(fetchedPlayers);
    });

    return () => unsub();
  }, [topicID, gameID, roomID]);

  // ── Langkah 2: Inisialisasi game state di Firebase (hanya sekali) ────────
  useEffect(() => {
    if (!topicID || !gameID || !roomID || players.length === 0 || initDone) return;

    let cancelled = false;

    const bootstrap = async () => {
      try {
        const questions = await getQuestions(topicID);
        const shuffled  = shuffle<UlarTanggaQuestion>(questions);

        await initializeUlarTanggaGameState(topicID, gameID, roomID, players, shuffled);
        await setGameStatus(topicID, gameID, roomID, 'playing');

        if (!cancelled) setInitDone(true);
      } catch (err) {
        console.error('Gagal bootstrap game Ular Tangga:', err);
      }
    };

    bootstrap();
    return () => { cancelled = true; };
  }, [topicID, gameID, roomID, players, initDone]);

  // ── Langkah 3: Subscribe ke gameState Firebase (real-time) ───────────────
  useEffect(() => {
    if (!topicID || !gameID || !roomID || !initDone) return;

    const unsub = listenToGameState(topicID, gameID, roomID, (state) => {
      setGameState(state);
      setLoading(false);

      // Navigasi ke halaman selesai jika game sudah berakhir
      if (state.gameStatus === 'finished' || state.gameStatus === 'abandoned') {
        router.push(`/lobby/${topicID}/${gameID}`);
      }
    });

    return () => unsub();
  }, [topicID, gameID, roomID, initDone, router]);

  // ── Update aktivitas pemain secara berkala ───────────────────────────────
  useEffect(() => {
    if (!myUID || !topicID || !gameID || !roomID || !initDone) return;

    updatePlayerActivity(topicID, gameID, roomID, myUID);

    activityTimerRef.current = setInterval(() => {
      updatePlayerActivity(topicID, gameID, roomID, myUID);
    }, ACTIVITY_INTERVAL_MS);

    return () => {
      if (activityTimerRef.current) clearInterval(activityTimerRef.current);
    };
  }, [myUID, topicID, gameID, roomID, initDone]);

  // ── Computed values ──────────────────────────────────────────────────────
  const currentPlayerIndex = gameState?.currentPlayerIndex ?? 0;
  const currentPlayer      = players[currentPlayerIndex];
  const isMyTurn           = !!myUID && currentPlayer?.uid === myUID;
  const pionPositions      = gameState?.pionPositions ?? new Array(players.length).fill(-1);
  const showQuestion       = gameState?.showQuestion   ?? false;
  const currentQuestion    = gameState
    ? (gameState.questions?.[gameState.currentQuestionIndex] ?? null)
    : null;

  // Map players ke format yang dibutuhkan komponen
  const playerListForUI = players.map((p, i) => ({
    id:     i + 1,
    name:   p.displayName || p.name || `Pemain ${i + 1}`,
    avatar: PION_AVATARS[i] ?? ularTangga.pion1,
  }));

  // ── Handler: Setelah dice selesai animasi ────────────────────────────────
  const handleDiceRollComplete = useCallback(
    async (rolledNumber: number, _isUserAction: boolean) => {
      if (!isMyTurn || !gameState) return;

      const currentPositions = [...(gameState.pionPositions ?? [])];
      let newPosition = (currentPositions[currentPlayerIndex] ?? 0) + rolledNumber;

      // Cegah melewati kotak 100
      if (newPosition > BOARD_SIZE) {
        newPosition = currentPositions[currentPlayerIndex] ?? 0;
      }

      // Cek tangga
      const tanggaMatch = TANGGA_UP.find((t) => t.start === newPosition);
      if (tanggaMatch) newPosition = tanggaMatch.end;

      // Cek ular
      const snakeMatch = SNAKES_DOWN.find((s) => s.start === newPosition);
      if (snakeMatch) newPosition = snakeMatch.end;

      currentPositions[currentPlayerIndex] = newPosition;

      // Cek menang
      if (newPosition >= BOARD_SIZE) {
        await updateGameState(topicID, gameID, roomID, {
          pionPositions:          currentPositions,
          gameStatus:             'finished',
          gameWinnerUID:          currentPlayer?.uid,
          gameWinnerDisplayName:  currentPlayer?.displayName,
          gameWonAt:              Date.now(),
          diceState: {
            isRolling:    false,
            currentNumber: rolledNumber,
            lastRoll:      rolledNumber,
          },
        });
        await cleanupGame(topicID, gameID, roomID);
        router.push(`/lobby/${topicID}/${gameID}`);
        return;
      }

      // Tentukan apakah tampilkan soal
      const shouldShowQuestion =
        gameState.questions && gameState.questions.length > 0;

      const nextQuestionIndex = shouldShowQuestion
        ? (gameState.currentQuestionIndex + 1) % gameState.questions.length
        : 0;

      await updateGameState(topicID, gameID, roomID, {
        pionPositions:        currentPositions,
        showQuestion:         shouldShowQuestion,
        waitingForAnswer:     shouldShowQuestion,
        currentQuestionIndex: shouldShowQuestion ? nextQuestionIndex : gameState.currentQuestionIndex,
        diceState: {
          isRolling:     false,
          currentNumber: rolledNumber,
          lastRoll:      rolledNumber,
        },
      });
    },
    [isMyTurn, gameState, currentPlayerIndex, currentPlayer, topicID, gameID, roomID, router],
  );

  // ── Handler: Jawab soal ───────────────────────────────────────────────────
  const handleSelectAnswer = useCallback(
    async (selectedIndex: number) => {
      if (!isMyTurn || !gameState || !currentQuestion) return;

      const isCorrect = selectedIndex === currentQuestion.correctIndex;

      // Giliran berikutnya
      const nextPlayerIndex = (currentPlayerIndex + 1) % Math.max(players.length, 1);

      await updateGameState(topicID, gameID, roomID, {
        showQuestion:         false,
        waitingForAnswer:     false,
        isCorrect,
        currentPlayerIndex:   nextPlayerIndex,
        diceState: {
          isRolling:     false,
          currentNumber: gameState.diceState?.currentNumber ?? 1,
          lastRoll:      gameState.diceState?.lastRoll ?? null,
        },
      });
    },
    [isMyTurn, gameState, currentQuestion, currentPlayerIndex, players.length, topicID, gameID, roomID],
  );

  // ── Render Loading ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="relative min-h-screen w-full overflow-x-hidden flex items-center justify-center bg-[#59a87d]">
        <p className="text-white text-xl font-semibold animate-pulse">
          Memuat permainan Ular Tangga...
        </p>
      </main>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
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
        {/* Tombol Back */}
        <button
          onClick={() => router.push(`/room/${params?.gameID}/${params?.topicID}/${params?.roomID}`)}
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
              pionPositionIndexes={pionPositions.map((pos) => pos - 1)} // Board 0-indexed
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
