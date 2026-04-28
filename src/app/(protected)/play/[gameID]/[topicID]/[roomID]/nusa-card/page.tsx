'use client';

import {useEffect, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import Header from '@/src/components/layout/Header';
import Footer from '@/src/components/layout/Footer';
import {useAuth} from '@/src/features/auth/hooks/useAuth';
import {getCurrentPlayers} from '@/src/features/lobby/services/lobby.service';
import {
  getQuestions,
  shuffle,
  initializeNusaCardGameState,
  subscribeToGameState,
  updateGameState,
  setGameStatus,
  cleanupGame,
} from '@/src/features/game/services/game.service';
import type {GamePlayer} from '@/src/features/game/services/game.service';

export default function NusaCardPage() {
  const params = useParams();
  const router = useRouter();
  const {user} = useAuth();

  const gameID = params.gameID as string;
  const topicID = params.topicID as string;
  const roomID = params.roomID as string;

  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [gameState, setGameStateData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isMyTurn, setIsMyTurn] = useState(false);

  // Initialize game
  useEffect(() => {
    const initGame = async () => {
      try {
        const playersData = await getCurrentPlayers(topicID, gameID, roomID);
        setPlayers(playersData);

        // Get questions and initialize game state
        const questions = await getQuestions(topicID);
        const shuffledQuestions = shuffle(questions);

        await initializeNusaCardGameState(topicID, gameID, roomID, playersData, shuffledQuestions);
        await setGameStatus(topicID, gameID, roomID, 'playing');

        setLoading(false);
      } catch (error) {
        console.error('Error initializing NusaCard game:', error);
        router.push(`/lobby/${topicID}/${gameID}`);
      }
    };

    initGame();
  }, [gameID, topicID, roomID, router]);

  // Subscribe to game state
  useEffect(() => {
    if (loading) return;

    const unsubscribe = subscribeToGameState(topicID, gameID, roomID, (state) => {
      if (state) {
        setGameStateData(state);
        setCurrentPlayerIndex(state.currentPlayerIndex || 0);

        // Check if it's my turn
        if (players[state.currentPlayerIndex]?.uid === user?.uid) {
          setIsMyTurn(true);
        } else {
          setIsMyTurn(false);
        }
      }
    });

    return () => unsubscribe();
  }, [loading, topicID, gameID, roomID, players, user?.uid]);

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
        <p>Current Player: {players[currentPlayerIndex]?.name}</p>
        <p>My Turn: {isMyTurn ? 'Yes' : 'No'}</p>
        <p>Total Players: {players.length}</p>

        {/* Game Component will be rendered here */}
        <div className="alert alert-info mt-4">
          NusaCard game component - Multiplayer card game mode
        </div>
      </div>
      <Footer />
    </main>
  );
}
