'use client';

import {useEffect, useMemo, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import GameBackground from '@/src/features/game-nuca/components/GameBackground';
import PauseModal from '@/src/components/layout/PauseModal';
import SettingButton from '@/src/components/layout/SettingButton';
import Loader from '@/src/components/ui/Loader';
import PlayerProfileNuca from '@/src/features/game-nuca/components/PlayerProfileNuca';
import PlayerHandCards, {type PlayerCard} from '@/src/features/game-nuca/components/PlayerHandCards';
import QuestionModal from '@/src/features/game-nuca/components/QuestionModal';
import {nuca} from '@/src/assets/images/nuca/cloudinaryAssets';

import {useAuth} from '@/src/features/auth/hooks/useAuth';
import {useGameBootstrap} from '@/src/features/game/hooks/useGameBootstrap';
import type {GamePlayer} from '@/src/features/game/services/game.service';
import type {AppUser} from '@/src/types/auth';
import {
  getQuestions,
  shuffle,
  initializeNusaCardGameState,
  listenToGameState,
  playCard,
  submitAnswer,
  setGameStatus,
  cleanupGame,
  type NusaCardGameState,
} from '@/src/features/game-nuca/services/nusa-card-game.service';

const AI_UID = 'ai-opponent-1';
const CARD_HUES = ['#f2a314', '#f3b02a', '#f1a52a', '#ef9917', '#e8b74a'];

export default function NusaCardVsAiPage() {
  const params = useParams();
  const router = useRouter();
  const {user, isInitialized} = useAuth();

  const gameID = params.gameID as string;
  const topicID = params.topicID as string;
  const roomID = params.roomID as string;
  // Dokumen Firestore di-scope per game+topik+slot — vs-AI ular-tangga dan
  // nusa-card sama-sama pakai slug "roomvs-ai", jadi wajib dibedain di sini.
  const roomKey = `${gameID}_${topicID}_${roomID}`;

  const [isPaused, setIsPaused] = useState(false);
  const [gameState, setGameState] = useState<NusaCardGameState | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  const roomPath = `/room/${gameID}/${topicID}/${roomID}`;
  const lobbyPath = `/lobby/${topicID}/${gameID}`;

  const {loading, gameError} = useGameBootstrap({
    isInitialized,
    user,
    router,
    lobbyPath,
    errorMessage: 'Gagal memulai game NusaCard vs AI.',
    bootstrap: async (currentUser: AppUser) => {
      const playerData: GamePlayer = {
        uid: currentUser.uid,
        name: currentUser.displayName || 'Player',
        photoURL: (currentUser.googlePhotoURL || currentUser.firebasePhotoURL) as string | undefined,
        joinedAt: new Date().toISOString(),
      };
      const aiOpponent: GamePlayer = {
        uid: AI_UID,
        name: 'AI Opponent',
        photoURL: undefined,
        joinedAt: new Date().toISOString(),
      };

      const questions = shuffle(await getQuestions(topicID));
      await initializeNusaCardGameState(
        roomKey,
        [
          {uid: playerData.uid, displayName: playerData.name, photoURL: playerData.photoURL},
          {uid: aiOpponent.uid, displayName: aiOpponent.name},
        ],
        questions,
      );
      await setGameStatus(roomKey, 'playing');

      return [playerData, aiOpponent];
    },
  });

  useEffect(() => {
    if (loading || !isInitialized) return;
    const unsubscribe = listenToGameState(roomKey, setGameState);
    return () => unsubscribe();
  }, [loading, isInitialized, roomKey]);

  // Redirect to lobby a beat after the game finishes, and mark the game
  // state abandoned if the player navigates away mid-game.
  useEffect(() => {
    if (gameState?.gameStatus !== 'finished') return;
    const timeoutId = setTimeout(() => router.push(lobbyPath), 1800);
    return () => clearTimeout(timeoutId);
  }, [gameState?.gameStatus, lobbyPath, router]);

  useEffect(() => {
    return () => {
      void cleanupGame(roomKey);
    };
  }, [roomKey]);

  const myUID = user?.uid ?? null;
  const opponentUID = AI_UID;
  const myHand: PlayerCard[] = useMemo(() => {
    if (!gameState || !myUID) return [];
    return (gameState.playerHands?.[myUID] ?? []).map((q, index) => ({
      id: q.id,
      title: q.text,
      subtitle: 'Q',
      hue: CARD_HUES[index % CARD_HUES.length],
    }));
  }, [gameState, myUID]);

  const myCorrect = (myUID && gameState?.correctCounts[myUID]) || 0;
  const aiCorrect = gameState?.correctCounts[opponentUID] || 0;

  const throwerUID = gameState ? gameState.players?.[gameState.throwerIndex]?.uid : null;
  const isMyTurnToThrow = throwerUID === myUID && !gameState?.activeQuestion;
  const isMyTurnToAnswer = gameState?.currentAnsweringUID === myUID && Boolean(gameState?.activeQuestion);
  const isAiThrowing = throwerUID === opponentUID && !gameState?.activeQuestion;
  const isAiAnswering = gameState?.currentAnsweringUID === opponentUID && Boolean(gameState?.activeQuestion);

  const handleSelectCard = (cardId: string) => {
    if (!isMyTurnToThrow || selectedCardId) return;
    setSelectedCardId(cardId);
  };

  const handlePlayAnimationDone = async (cardId: string) => {
    setSelectedCardId(null);
    if (!myUID) return;
    await playCard(roomKey, myUID, cardId);
  };

  const handleAnswer = async (index: number) => {
    if (!myUID || isResolving) return;
    setIsResolving(true);
    try {
      await submitAnswer(roomKey, myUID, index);
    } finally {
      setIsResolving(false);
    }
  };

  // AI bot: play a random card when it's the AI's turn to throw.
  useEffect(() => {
    if (!isAiThrowing || !gameState) return;
    const hand = gameState.playerHands?.[opponentUID] ?? [];
    if (hand.length === 0) return;
    const timeoutId = setTimeout(() => {
      const card = hand[Math.floor(Math.random() * hand.length)];
      void playCard(roomKey, opponentUID, card.id);
    }, 1200);
    return () => clearTimeout(timeoutId);
  }, [isAiThrowing, gameState, roomKey]);

  // AI bot: answer after a delay, correct ~65% of the time.
  useEffect(() => {
    if (!isAiAnswering || !gameState?.activeQuestion) return;
    const timeoutId = setTimeout(() => {
      const {correctIndex, options} = gameState.activeQuestion!;
      const isCorrectGuess = Math.random() < 0.65;
      const index = isCorrectGuess
        ? correctIndex
        : (correctIndex + 1 + Math.floor(Math.random() * (options.length - 1))) % options.length;
      void submitAnswer(roomKey, opponentUID, index);
    }, 2200);
    return () => clearTimeout(timeoutId);
  }, [isAiAnswering, gameState, roomKey]);

  if (loading) {
    return <Loader message="Menyiapkan game NusaCard vs AI..." />;
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden">

      <div className="fixed inset-0 -z-10 bg-[#59a87d]">
        <GameBackground />
      </div>

      <button
        onClick={() => router.push(roomPath)}
        className="absolute left-10 lg:left-7 top-7 z-50 text-white transition-transform"
        aria-label="Kembali"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <SettingButton onClick={() => setIsPaused(true)} />

      {gameError && (
        <div className="absolute top-20 left-1/2 z-40 -translate-x-1/2 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-700">
          {gameError}
        </div>
      )}

      <section className="absolute inset-0 z-20 flex flex-col items-center justify-between py-10">
        {/* AI opponent di atas */}
        <div className="flex flex-col items-center gap-2">
          <PlayerProfileNuca
            isActive={isAiThrowing || isAiAnswering}
            status={isAiThrowing ? 'thrower' : isAiAnswering ? 'answering' : 'idle'}
            sizeClassName="h-12 w-12 sm:h-14 sm:w-14"
          />
          <p className="text-sm font-semibold text-white drop-shadow">AI Opponent — {aiCorrect} benar</p>
          {isAiThrowing && <p className="text-xs text-white/80">AI memilih kartu...</p>}
        </div>

        {/* Tengah */}
        <div className="flex flex-col items-center gap-2">
          <img src={nuca.nuca} alt="Deck" className="h-20 w-14 rounded-lg shadow-lg" />
          {gameState?.gameStatus === 'finished' && (
            <p className="rounded-lg bg-white/90 px-4 py-2 text-lg font-bold text-[#1f2a1f] shadow">
              {gameState.winnerUID === myUID ? 'Kamu menang!' : gameState.winnerUID === opponentUID ? 'AI menang!' : 'Seri!'}
            </p>
          )}
        </div>

        {/* Pemain di bawah */}
        <div className="flex flex-col items-center gap-3">
          <PlayerProfileNuca
            isActive={isMyTurnToThrow}
            status={isMyTurnToThrow ? 'thrower' : isMyTurnToAnswer ? 'answering' : 'idle'}
            sizeClassName="h-12 w-12 sm:h-14 sm:w-14"
            avatarUrl={user?.firebasePhotoURL || user?.googlePhotoURL || undefined}
          />
          <p className="text-sm font-semibold text-white drop-shadow">
            {user?.displayName || 'Kamu'} — {myCorrect} benar
          </p>
          <PlayerHandCards
            cards={myHand}
            selectedCardId={selectedCardId}
            canPlay={isMyTurnToThrow}
            onSelectCard={handleSelectCard}
            onPlayAnimationComplete={handlePlayAnimationDone}
          />
          {!isMyTurnToThrow && !isMyTurnToAnswer && gameState?.gameStatus === 'playing' && (
            <p className="text-xs text-white/80">Menunggu giliran AI...</p>
          )}
        </div>
      </section>

      <QuestionModal
        isOpen={isMyTurnToAnswer}
        onClose={() => {}}
        question={gameState?.activeQuestion?.text}
        choices={gameState?.activeQuestion?.options}
        onSelectChoice={(index) => void handleAnswer(index)}
        disabled={isResolving}
      />

      <PauseModal isOpen={isPaused} onClose={() => setIsPaused(false)} />
    </main>
  );
}
