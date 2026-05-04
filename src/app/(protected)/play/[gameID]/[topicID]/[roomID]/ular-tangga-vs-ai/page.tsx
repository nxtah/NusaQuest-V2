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
  shuffle,
  initializeUlarTanggaGameState,
  updateGameState,
  updatePionPositions,
  subscribeToTypedGameState,
  setGameStatus,
} from '@/src/features/game/services/game.service';
import type {GamePlayer, UlarTanggaGameState} from '@/src/features/game/services/game.service';
import type {AppUser} from '@/src/types/auth';

const BOARD_LIMIT = 30;

export default function UlarTanggaVsAiPage() {
  const params = useParams();
  const router = useRouter();
  const {user, isInitialized} = useAuth();

  const gameID = params.gameID as string;
  const topicID = params.topicID as string;
  const roomID = params.roomID as string;

  const [gameState, setGameStateData] = useState<UlarTanggaGameState | null>(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [pionPositions, setPionPositions] = useState<number[]>([]);
  const [isRolling, setIsRolling] = useState(false);

  const {players, loading, gameError} = useGameBootstrap({
    isInitialized,
    user,
    router,
    lobbyPath: `/lobby/${topicID}/${gameID}`,
    errorMessage: 'Gagal memulai game Ular Tangga vs AI.',
    onBootstrapped: () => {
      setPionPositions([0, 0]);
    },
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

      await initializeUlarTanggaGameState(topicID, gameID, roomID, playersData, shuffledQuestions);
      await setGameStatus(topicID, gameID, roomID, 'playing');

      return playersData;
    },
  });

  const activePlayers = useMemo(() => gameState?.players || players, [gameState?.players, players]);
  const currentPlayerIndex = gameState?.currentPlayerIndex || 0;
  const currentPlayer = activePlayers[currentPlayerIndex];

  const finishAndCleanup = async (winner?: GamePlayer) => {
    await finishGame(topicID, gameID, roomID, winner ? {uid: winner.uid, displayName: winner.name} : undefined);
  };

  const handlePlayerRoll = async () => {
    if (!gameState || isRolling || currentPlayer?.uid === 'ai-opponent-1' || !isMyTurn) return;

    const roll = Math.floor(Math.random() * 6) + 1;
    const nextPositions = [...(gameState.pionPositions || pionPositions)];
    const nextPosition = Math.min((nextPositions[currentPlayerIndex] || 0) + roll, BOARD_LIMIT);

    setIsRolling(true);
    try {
      nextPositions[currentPlayerIndex] = nextPosition;

      await updatePionPositions(topicID, gameID, roomID, nextPositions);
      await updateGameState(topicID, gameID, roomID, {
        lastDiceRoll: roll,
        lastMovedByUID: currentPlayer.uid,
        lastMovedAt: new Date().toISOString(),
        turnPhase: 'moved',
      });

      if (nextPosition >= BOARD_LIMIT) {
        await finishAndCleanup(currentPlayer);
        return;
      }

      await advanceGameTurn(topicID, gameID, roomID);
    } finally {
      setIsRolling(false);
    }
  };

  const handleAiRoll = async () => {
    if (!gameState || currentPlayer?.uid !== 'ai-opponent-1' || isRolling) return;

    const roll = Math.floor(Math.random() * 6) + 1;
    const nextPositions = [...(gameState.pionPositions || pionPositions)];
    const nextPosition = Math.min((nextPositions[currentPlayerIndex] || 0) + roll, BOARD_LIMIT);

    setIsRolling(true);
    try {
      nextPositions[currentPlayerIndex] = nextPosition;

      await updatePionPositions(topicID, gameID, roomID, nextPositions);
      await updateGameState(topicID, gameID, roomID, {
        lastDiceRoll: roll,
        lastMovedByUID: currentPlayer.uid,
        lastMovedAt: new Date().toISOString(),
        turnPhase: 'ai-moved',
      });

      if (nextPosition >= BOARD_LIMIT) {
        await finishAndCleanup(currentPlayer);
        return;
      }

      await advanceGameTurn(topicID, gameID, roomID);
    } finally {
      setIsRolling(false);
    }
  };

  // Subscribe to game state
  useEffect(() => {
    if (loading || !isInitialized) return;

    const unsubscribe = subscribeToTypedGameState<UlarTanggaGameState>(topicID, gameID, roomID, (state) => {
      if (state) {
        setGameStateData(state);
        setPionPositions(state.pionPositions || [0, 0]);
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
        void handleAiRoll();
      }, 900);

      return () => clearTimeout(timeoutId);
    }

    return undefined;
  }, [currentPlayer?.uid, gameState?.gameStatus, isInitialized, loading]);

  if (loading) {
    return (
      <main>
        <Header showBackIcon />
        <div className="text-center py-5">Initializing Ular Tangga vs AI...</div>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Header showBackIcon />
      <div className="container py-5">
        <h2>Ular Tangga vs AI</h2>
        {gameError && <div className="alert alert-warning">{gameError}</div>}
        <p>Game Status: {gameState?.gameStatus || 'unknown'}</p>
        <p>Current Player: {currentPlayer?.name || 'Unknown'}</p>
        <p>My Turn: {isMyTurn ? 'Yes' : 'No'}</p>
        <p>Total Questions: {gameState?.questions?.length || 0}</p>
        <p>Board Progress: {pionPositions.join(', ') || '0, 0'}</p>

        <button className="btn btn-primary mt-3" onClick={() => void handlePlayerRoll()} disabled={!isMyTurn || isRolling}>
          Roll Dice
        </button>

        {/* Game board and components will be rendered here */}
        <div className="alert alert-info mt-4">
          Ular Tangga game component - Single player vs AI mode
        </div>
      </div>
      <Footer />
    </main>
  );
}
