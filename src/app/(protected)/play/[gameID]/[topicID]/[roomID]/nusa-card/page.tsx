'use client';

import {useEffect, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import Header from '@/src/components/layout/Header';
import Footer from '@/src/components/layout/Footer';
import {useAuth} from '@/src/features/auth/hooks/useAuth';
import {useGameBootstrap} from '@/src/features/game/hooks/useGameBootstrap';
import {useGameLifecycle} from '@/src/features/game/hooks/useGameLifecycle';
import {getCurrentPlayers} from '@/src/features/lobby/services/lobby.service';
import {
  getQuestions,
  shuffle,
  initializeNusaCardGameState,
  subscribeToTypedGameState,
  updateGameState,
  setGameStatus,
} from '@/src/features/game/services/game.service';
import type {GamePlayer, NusaCardGameState} from '@/src/features/game/services/game.service';

export default function NusaCardPage() {
  const params = useParams();
  const router = useRouter();
  const {user, isInitialized} = useAuth();

  const gameID = params.gameID as string;
  const topicID = params.topicID as string;
  const roomID = params.roomID as string;

  const [gameState, setGameStateData] = useState<NusaCardGameState | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isMyTurn, setIsMyTurn] = useState(false);

  const {players, loading, gameError} = useGameBootstrap({
    isInitialized,
    user,
    router,
    lobbyPath: `/lobby/${topicID}/${gameID}`,
    errorMessage: 'Gagal memulai game NusaCard.',
    bootstrap: async () => {
      const playersData = await getCurrentPlayers(topicID, gameID, roomID);

      if (!playersData.length) {
        throw new Error('Room kosong atau data pemain belum tersedia.');
      }

      const questions = await getQuestions(topicID);
      const shuffledQuestions = shuffle(questions);

      await initializeNusaCardGameState(topicID, gameID, roomID, playersData, shuffledQuestions);
      await setGameStatus(topicID, gameID, roomID, 'playing');

      return playersData;
    },
  });

  // Subscribe to game state
  useEffect(() => {
    if (loading || !isInitialized) return;

    const unsubscribe = subscribeToTypedGameState<NusaCardGameState>(topicID, gameID, roomID, (state) => {
      if (state) {
        setGameStateData(state);
        setCurrentPlayerIndex(state.currentPlayerIndex || 0);

        // Check if it's my turn
        const activePlayers = state.players || players;
        setIsMyTurn(activePlayers[state.currentPlayerIndex]?.uid === user?.uid);
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

  const activePlayers = gameState?.players || players;
  const currentPlayer = activePlayers[currentPlayerIndex];

  if (loading) {
    return (
      <main>
        <Header showBackIcon />
        <div className="text-center py-5">Initializing NusaCard game...</div>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Header showBackIcon />
      <div className="container py-5">
        <h2>NusaCard Game</h2>
        {gameError && <div className="alert alert-warning">{gameError}</div>}
        <p>Game Status: {gameState?.gameStatus || 'unknown'}</p>
        <p>Current Player: {currentPlayer?.name || 'Unknown'}</p>
        <p>My Turn: {isMyTurn ? 'Yes' : 'No'}</p>
        <p>Total Players: {activePlayers.length}</p>
        <p>Total Questions: {gameState?.questions?.length || 0}</p>

        {/* Game Component will be rendered here */}
        <div className="alert alert-info mt-4">
          NusaCard game component - Multiplayer card game mode
        </div>
      </div>
      <Footer />
    </main>
  );
}
