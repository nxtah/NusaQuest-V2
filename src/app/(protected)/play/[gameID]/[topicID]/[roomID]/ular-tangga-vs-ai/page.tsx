'use client';

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useRouter, useParams} from 'next/navigation';

import GameBackground from '@/src/features/game-ular-tangga/components/GameBackground';
import Board from '@/src/features/game-ular-tangga/components/Board';
import PlayerTurnBox from '@/src/features/game-ular-tangga/components/PlayerTurnBox';
import {ularTangga} from '@/src/assets/images/ular-tangga/cloudinaryAssets';
import PauseModal from '@/src/components/layout/PauseModal';
import SettingButton from '@/src/components/layout/SettingButton';
import Loader from '@/src/components/ui/Loader';
import {useAuth} from '@/src/features/auth/hooks/useAuth';

import {
  getQuestions,
  shuffle,
  initializeUlarTanggaGameState,
  listenToGameState,
  updateGameState,
  setGameStatus,
  cleanupGame,
  updatePlayerActivity,
  movePawn,
  submitAnswer,
  nextTurn,
  type UlarTanggaGameState,
  type GamePlayer,
} from '@/src/features/game-ular-tangga/services/ular-tangga-game.service';
import {LADDERS} from '@/src/features/game-ular-tangga/utils/board-rules';

const AI_UID = 'ai-opponent-1';

export default function UlarTanggaVsAiPage() {
  const router = useRouter();
  const params = useParams();

  const gameID = params?.gameID as string;
  const topicID = params?.topicID as string;
  const roomID = params?.roomID as string;
  // Dokumen Firestore di-scope per game+topik+slot — vs-AI ular-tangga dan
  // nusa-card sama-sama pakai slug "roomvs-ai", jadi wajib dibedain di sini.
  const roomKey = `${gameID}_${topicID}_${roomID}`;

  const {user, isInitialized} = useAuth();
  const myUID = user?.uid ?? null;

  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [gameState, setGameState] = useState<UlarTanggaGameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const lobbyPath = `/lobby/${topicID}/${gameID}`;
  const roomPath = `/room/${gameID}/${topicID}/${roomID}`;

  // ── Bootstrap: init game state langsung (gak ada waiting room, selalu 2 pemain) ──
  useEffect(() => {
    if (!isInitialized || !user || !topicID || !gameID || !roomID) return;
    let isActive = true;

    (async () => {
      try {
        const humanPlayer: GamePlayer = {
          uid: user.uid,
          displayName: user.displayName || 'Pemain',
          photoURL: (user.googlePhotoURL || user.firebasePhotoURL) as string | undefined,
          playerIndex: 0,
        };
        const aiPlayer: GamePlayer = {
          uid: AI_UID,
          displayName: 'AI Opponent',
          playerIndex: 1,
        };
        const indexedPlayers = [humanPlayer, aiPlayer];

        const questions = await getQuestions(topicID);
        const shuffled = shuffle(questions);

        await initializeUlarTanggaGameState(topicID, gameID, roomKey, indexedPlayers, shuffled);
        await setGameStatus(topicID, gameID, roomKey, 'playing');
        // AI selalu "offline" — bot-takeover logic yang udah ada di service ini
        // yang otomatis jalanin giliran AI (dadu + jawab acak).
        await updatePlayerActivity(topicID, gameID, roomKey, AI_UID, {isActive: false, playerIndex: 1, lastActivity: 0});
        await updatePlayerActivity(topicID, gameID, roomKey, user.uid, {playerIndex: 0});

        if (!isActive) return;
        setPlayers(indexedPlayers);
      } catch (error) {
        console.error('Gagal bootstrap Ular Tangga vs AI:', error);
      } finally {
        if (isActive) setLoading(false);
      }
    })();

    return () => {
      isActive = false;
    };
  }, [isInitialized, user, topicID, gameID, roomKey]);

  // ── Subscribe gameState ──────────────────────────────────────────────────
  useEffect(() => {
    if (loading || !topicID || !gameID || !roomID) return;
    const unsub = listenToGameState(topicID, gameID, roomKey, setGameState);
    return () => unsub();
  }, [loading, topicID, gameID, roomKey]);

  // ── Redirect ke lobby sesaat setelah game selesai ────────────────────────
  useEffect(() => {
    if (gameState?.gameStatus !== 'finished') return;
    const timeoutId = setTimeout(() => router.push(lobbyPath), 1800);
    return () => clearTimeout(timeoutId);
  }, [gameState?.gameStatus, lobbyPath, router]);

  useEffect(() => {
    return () => {
      void cleanupGame(topicID, gameID, roomKey);
    };
  }, [topicID, gameID, roomKey]);

  // Jaga aktivitas pemain manusia tetap "online" biar bot-takeover cuma jalan buat AI.
  useEffect(() => {
    if (!myUID || loading) return;
    const interval = setInterval(() => {
      updatePlayerActivity(topicID, gameID, roomKey, myUID, {playerIndex: 0});
    }, 30_000);
    return () => clearInterval(interval);
  }, [myUID, loading, topicID, gameID, roomKey]);

  const currentPlayerIndex = gameState?.currentPlayerIndex ?? 0;
  const currentPlayer = players[currentPlayerIndex];
  const isMyTurn = !!myUID && currentPlayer?.uid === myUID;
  const isDiceDisabled = !gameState || gameState.isMoving || gameState.waitingForAnswer || gameState.showQuestion;

  const currentActivity = currentPlayer ? gameState?.playerActivity?.[currentPlayer.uid] : null;
  const isCurrentPlayerOffline = currentActivity
    ? (!currentActivity.isActive || Date.now() - currentActivity.lastActivity > 60000)
    : false;
  const isBotActing = isCurrentPlayerOffline && !isMyTurn;

  const pionPositionsRaw = gameState?.pionPositions ?? [0, 0];
  const showQuestion = gameState?.showQuestion ?? false;
  const currentQuestion = gameState ? (gameState.questions?.[gameState.currentQuestionIndex] ?? null) : null;

  const playerListForUI = players.map((p, i) => ({
    id: i + 1,
    name: p.displayName || p.name || `Pemain ${i + 1}`,
    avatar: (p.photoURL && p.photoURL.startsWith('http'))
      ? p.photoURL
      : (i === 0 ? ularTangga.pion1 : `https://api.dicebear.com/7.x/bottts/svg?seed=${p.uid}&backgroundColor=b6e3f4`),
  }));

  const handleDiceRollStart = useCallback(async (rolledNumber: number) => {
    if ((!isMyTurn && !isBotActing) || !gameState || gameState.isMoving) return;
    await updateGameState(topicID, gameID, roomKey, {
      isMoving: true,
      diceState: {
        isRolling: true,
        currentNumber: rolledNumber,
        lastRoll: gameState.diceState?.lastRoll ?? null,
        rollingPlayerId: myUID ?? undefined,
      },
    });
  }, [isMyTurn, isBotActing, gameState, topicID, gameID, roomKey, myUID]);

  const handleDiceRollComplete = useCallback(async (rolledNumber: number) => {
    if ((!isMyTurn && !isBotActing) || !gameState) return;
    await movePawn(topicID, gameID, roomKey, gameState.currentPlayerIndex, rolledNumber);
  }, [isMyTurn, isBotActing, gameState, topicID, gameID, roomKey]);

  const handleSelectAnswer = useCallback(async (selectedIndex: number) => {
    if (!isMyTurn && !isBotActing) return;
    await submitAnswer(topicID, gameID, roomKey, selectedIndex);
    setTimeout(async () => {
      await nextTurn(topicID, gameID, roomKey);
    }, 2000);
  }, [isMyTurn, isBotActing, topicID, gameID, roomKey]);

  const lastBotTurnRef = useRef<number>(-1);
  useEffect(() => {
    const currentTurn = gameState?.turnCounter || 0;
    if (lastBotTurnRef.current !== currentTurn) lastBotTurnRef.current = -1;
  }, [gameState?.turnCounter]);

  useEffect(() => {
    if (!gameState || !isBotActing || isPaused || gameState.gameStatus !== 'playing') return;

    if (gameState.waitingForAnswer && gameState.showQuestion) {
      const timer = setTimeout(() => {
        void handleSelectAnswer(Math.floor(Math.random() * 4));
      }, 2500);
      return () => clearTimeout(timer);
    }

    if (!gameState.diceState?.isRolling && !gameState.waitingForAnswer) {
      const currentTurnCount = gameState.turnCounter || 0;
      if (lastBotTurnRef.current === currentTurnCount) return;

      const timer = setTimeout(() => {
        lastBotTurnRef.current = currentTurnCount;
        const randomDice = Math.floor(Math.random() * 6) + 1;
        void handleDiceRollStart(randomDice);
        setTimeout(() => void handleDiceRollComplete(randomDice), 1500);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState, isBotActing, isPaused, handleSelectAnswer, handleDiceRollStart, handleDiceRollComplete]);

  if (loading) {
    return <Loader message="Menyiapkan Ular Tangga vs AI..." />;
  }

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden">

      <div className="fixed inset-0 -z-10 bg-[#59a87d]">
        <GameBackground />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start lg:items-center justify-center min-h-[100svh] pt-2 md:pt-4 lg:pt-8 pb-0 px-2 md:px-5 lg:px-8 w-full max-w-[1400px] mx-auto">
        <button
          onClick={() => router.push(roomPath)}
          className="absolute left-10 lg:left-7 top-7 z-50 text-white transition-transform hover:scale-110"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <SettingButton onClick={() => setIsPaused(true)} />

        {gameState?.gameStatus === 'finished' && (
          <div className="absolute top-20 left-1/2 z-40 -translate-x-1/2 rounded-lg bg-white/95 px-6 py-3 text-lg font-bold text-[#1f2a1f] shadow-lg">
            {currentPlayer?.uid === myUID ? 'Kamu menang!' : 'AI menang!'}
          </div>
        )}

        <div className="flex-1 w-full flex items-start justify-center z-20 mt-1 md:mt-2 lg:mt-0">
          <div className="w-full aspect-square max-w-[80vh] md:max-w-[75vh] lg:max-w-[80vh] ml-4 md:ml-12 lg:ml-4">
            <Board
              pionPositionIndexes={pionPositionsRaw.map((pos) => (pos <= 1 ? 0 : pos - 1))}
              tanggaUp={Object.entries(LADDERS).map(([start, end]) => ({start: Number(start), end: Number(end)}))}
              isCorrect={gameState?.isCorrect ?? false}
            />
          </div>
        </div>

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

        <PauseModal isOpen={isPaused} onClose={() => setIsPaused(false)} />
      </div>
    </main>
  );
}
