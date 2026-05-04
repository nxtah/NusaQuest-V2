'use client';

import {useEffect, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import Header from '@/src/components/layout/Header';
import Footer from '@/src/components/layout/Footer';
import {useAuth} from '@/src/features/auth/hooks/useAuth';
import {useGameBootstrap} from '@/src/features/game/hooks/useGameBootstrap';
import {getCurrentPlayers} from '@/src/features/lobby/services/lobby.service';
import {useGameLifecycle} from '@/src/features/game/hooks/useGameLifecycle';
import {
  advanceGameTurn,
  getQuestions,
  shuffle,
  initializeUlarTanggaGameState,
  finishGame,
  updateGameState,
  updatePionPositions,
  subscribeToTypedGameState,
  setGameStatus,
  cleanupGame,
} from '@/src/features/game/services/game.service';
import type {GamePlayer, UlarTanggaGameState} from '@/src/features/game/services/game.service';
import type {AppUser} from '@/src/types/auth';

const BOARD_LIMIT = 30;

export default function UlarTanggaPage() {
  const params = useParams();
  const router = useRouter();
  const {user, isInitialized} = useAuth();

  const gameID = params.gameID as string;
  const topicID = params.topicID as string;
  const roomID = params.roomID as string;

  const [gameState, setGameStateData] = useState<UlarTanggaGameState | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [pionPositions, setPionPositions] = useState<number[]>([]);
  const [isRolling, setIsRolling] = useState(false);

  const {players, loading, gameError} = useGameBootstrap({
    isInitialized,
    user,
    router,
    lobbyPath: `/lobby/${topicID}/${gameID}`,
    errorMessage: 'Gagal memulai game Ular Tangga.',
    onBootstrapped: (nextPlayers: GamePlayer[]) => {
      setPionPositions(new Array(nextPlayers.length).fill(0));
    },
    bootstrap: async (currentUser: AppUser) => {
      const playersData = await getCurrentPlayers(topicID, gameID, roomID);

      if (!playersData.length) {
        throw new Error('Room kosong atau data pemain belum tersedia.');
      }

      const questions = await getQuestions(topicID);
      const shuffledQuestions = shuffle(questions);

      await initializeUlarTanggaGameState(topicID, gameID, roomID, playersData, shuffledQuestions);
      await setGameStatus(topicID, gameID, roomID, 'playing');

      return playersData;
    },
  });

  // Subscribe to game state
  useEffect(() => {
    if (loading || !isInitialized) return;

    const unsubscribe = subscribeToTypedGameState<UlarTanggaGameState>(topicID, gameID, roomID, (state) => {
      if (state) {
        setGameStateData(state);
        setCurrentPlayerIndex(state.currentPlayerIndex || 0);
        const activePlayers = state.players || players;
        setPionPositions(state.pionPositions || new Array(activePlayers.length).fill(0));

        // Check if it's my turn
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

  const finishAndCleanup = async (winner?: GamePlayer) => {
    await finishGame(topicID, gameID, roomID, winner ? {uid: winner.uid, displayName: winner.name} : undefined);
    await cleanupGame(topicID, gameID, roomID);
    router.push(`/lobby/${topicID}/${gameID}`);
  };

  const handleRollDice = async () => {
    if (!isMyTurn || isRolling || !gameState || !currentPlayer) return;

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

  const activePlayers = gameState?.players || players;
  const currentPlayer = activePlayers[currentPlayerIndex];

  if (loading) {
    return (
      <main>
        <Header showBackIcon />
        <div className="text-center py-5">Initializing Ular Tangga game...</div>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Header showBackIcon />
      <div className="container py-5">
        <h2>Ular Tangga</h2>
        {gameError && <div className="alert alert-warning">{gameError}</div>}
        <p>Game Status: {gameState?.gameStatus || 'unknown'}</p>
        <p>Current Player: {currentPlayer?.name || 'Unknown'}</p>
        <p>My Turn: {isMyTurn ? 'Yes' : 'No'}</p>
        <p>Total Players: {activePlayers.length}</p>
        <p>Total Questions: {gameState?.questions?.length || 0}</p>
        <p>Board Progress: {pionPositions.join(', ') || '0'}</p>
        <p>Last Dice Roll: {gameState?.lastDiceRoll || '-'}</p>

        <button className="btn btn-primary mt-3" onClick={() => void handleRollDice()} disabled={!isMyTurn || isRolling}>
          Roll Dice
        </button>

        {/* Game board and components will be rendered here */}
        <div className="alert alert-info mt-4">
          Ular Tangga game component - Multiplayer board game mode
        </div>
      </div>
      <Footer />
    </main>
  );
}
