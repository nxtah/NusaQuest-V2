'use client';

import {useEffect, useMemo, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import Header from '@/src/components/layout/Header';
import Footer from '@/src/components/layout/Footer';
import {useAuth} from '@/src/features/auth/hooks/useAuth';
import {useGameBootstrap} from '@/src/features/game/hooks/useGameBootstrap';
import {useGameLifecycle} from '@/src/features/game/hooks/useGameLifecycle';
import {
  advanceGameTurn,
  finishGame,
  getQuestions,
  initializeNusaCardGameState,
  setGameStatus,
  shuffle,
  subscribeToTypedGameState,
  updateGameState,
} from '@/src/features/game/services/game.service';
import {type GamePlayer, type NusaCardGameState} from '@/src/features/game/services/game.service';
import type {AppUser} from '@/src/types/auth';

export default function NusaCardVsAiPage() {
  const params = useParams();
  const router = useRouter();
  const {user, isInitialized} = useAuth();

  const gameID = params.gameID as string;
  const topicID = params.topicID as string;
  const roomID = params.roomID as string;

  const [gameState, setGameStateData] = useState<NusaCardGameState | null>(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [isResolvingTurn, setIsResolvingTurn] = useState(false);

  const {players, loading, gameError} = useGameBootstrap({
    isInitialized,
    user,
    router,
    lobbyPath: `/lobby/${topicID}/${gameID}`,
    errorMessage: 'Gagal memulai game NusaCard vs AI.',
    bootstrap: async (currentUser: AppUser) => {
      const playerData: GamePlayer = {
        uid: currentUser.uid,
        name: currentUser.displayName || 'Player',
        photoURL: (currentUser.googlePhotoURL || currentUser.firebasePhotoURL) as string | undefined,
        joinedAt: new Date().toISOString(),
      };

      const aiOpponent: GamePlayer = {
        uid: 'ai-opponent-1',
        name: 'AI Opponent',
        photoURL: undefined,
        joinedAt: new Date().toISOString(),
      };

      const playersData = [playerData, aiOpponent];

      const questions = await getQuestions(topicID);
      const shuffledQuestions = shuffle(questions);

      await initializeNusaCardGameState(topicID, gameID, roomID, playersData, shuffledQuestions);
      await setGameStatus(topicID, gameID, roomID, 'playing');

      return playersData;
    },
  });

  const activePlayers = useMemo(() => gameState?.players || players, [gameState?.players, players]);
  const currentPlayerIndex = gameState?.currentPlayerIndex || 0;
  const currentPlayer = activePlayers[currentPlayerIndex];

  const finishAndCleanup = async (winner?: GamePlayer) => {
    await finishGame(topicID, gameID, roomID, winner ? {uid: winner.uid, displayName: winner.name} : undefined);
    router.push(`/lobby/${topicID}/${gameID}`);
  };

  const resolveTurn = async (actorIndex: number) => {
    if (!gameState || isResolvingTurn) return;

    const questions = gameState.questions || [];
    const nextQuestionIndex = (gameState.currentQuestionIndex || 0) + 1;
    const nextState = {
      currentQuestionIndex: nextQuestionIndex,
      lastActionByUID: activePlayers[actorIndex]?.uid || null,
      lastActionAt: new Date().toISOString(),
      turnPhase: 'resolved',
    };

    setIsResolvingTurn(true);
    try {
      if (nextQuestionIndex >= questions.length) {
        await updateGameState(topicID, gameID, roomID, nextState);
        await finishAndCleanup(activePlayers[actorIndex]);
        return;
      }

      await updateGameState(topicID, gameID, roomID, nextState);
      await advanceGameTurn(topicID, gameID, roomID);
    } finally {
      setIsResolvingTurn(false);
    }
  };

  const handlePlayerDraw = async () => {
    if (!isMyTurn || !currentPlayer || currentPlayer.uid === 'ai-opponent-1') return;
    await resolveTurn(currentPlayerIndex);
  };

  const handleAiTurn = async () => {
    if (!gameState || currentPlayer?.uid !== 'ai-opponent-1' || isResolvingTurn) return;

    const shouldFinish = (gameState.currentQuestionIndex || 0) + 1 >= (gameState.questions || []).length;
    setIsResolvingTurn(true);
    try {
      await updateGameState(topicID, gameID, roomID, {
        lastActionByUID: currentPlayer.uid,
        lastActionAt: new Date().toISOString(),
        turnPhase: 'ai-resolved',
        currentQuestionIndex: (gameState.currentQuestionIndex || 0) + 1,
      });

      if (shouldFinish) {
        await finishAndCleanup(currentPlayer);
        return;
      }

      await advanceGameTurn(topicID, gameID, roomID);
    } finally {
      setIsResolvingTurn(false);
    }
  };

  // Subscribe to game state
  useEffect(() => {
    if (loading || !isInitialized) return;
    const unsubscribe = subscribeToTypedGameState<NusaCardGameState>(topicID, gameID, roomID, (state) => {
      if (state) {
        setGameStateData(state);
        setIsMyTurn((state.players || players)[state.currentPlayerIndex]?.uid === user?.uid);
      }
    });

    return () => unsubscribe();
  }, [gameID, isInitialized, loading, players, roomID, topicID, user?.uid]);

  useGameLifecycle({
    topicID,
    gameID,
    roomID,
    gameStatus: gameState?.gameStatus,
    router,
  });

  useEffect(() => {
    if (loading || !isInitialized || gameState?.gameStatus !== 'playing') return;

    if (currentPlayer?.uid === 'ai-opponent-1') {
      const timeoutId = setTimeout(() => {
        void handleAiTurn();
      }, 900);

      return () => clearTimeout(timeoutId);
    }

    return undefined;
  }, [currentPlayer?.uid, gameState?.gameStatus, isInitialized, loading]);

  if (loading) {
    return (
      <main>
        <Header showBackIcon />
        <div className="text-center py-5">Initializing NusaCard vs AI...</div>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Header showBackIcon />
      <div className="container py-5">
        <h2>NusaCard vs AI</h2>
        {gameError && <div className="alert alert-warning">{gameError}</div>}
        <p>Game Status: {gameState?.gameStatus || 'unknown'}</p>
        <p>Current Player: {currentPlayer?.name || 'Unknown'}</p>
        <p>My Turn: {isMyTurn ? 'Yes' : 'No'}</p>
        <p>Total Players: {activePlayers.length}</p>
        <p>Total Questions: {gameState?.questions?.length || 0}</p>
        <p>Current Question Index: {gameState?.currentQuestionIndex || 0}</p>

        <button className="btn btn-primary mt-3" onClick={() => void handlePlayerDraw()} disabled={!isMyTurn || isResolvingTurn}>
          Draw Card
        </button>

        {/* Game Component will be rendered here */}
        <div className="alert alert-info mt-4">
          NusaCard game component - Single player vs AI mode
        </div>
      </div>
      <Footer />
    </main>
  );
}
