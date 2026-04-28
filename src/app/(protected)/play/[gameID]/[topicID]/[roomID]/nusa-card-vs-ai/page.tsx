'use client';

import {useEffect, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import Header from '@/src/components/layout/Header';
import Footer from '@/src/components/layout/Footer';
import {useAuth} from '@/src/features/auth/hooks/useAuth';
import {
  getQuestions,
  shuffle,
  initializeNusaCardGameState,
  subscribeToGameState,
  setGameStatus,
} from '@/src/features/game/services/game.service';
import type {GamePlayer} from '@/src/features/game/services/game.service';

export default function NusaCardVsAiPage() {
  const params = useParams();
  const router = useRouter();
  const {user} = useAuth();

  const gameID = params.gameID as string;
  const topicID = params.topicID as string;
  const roomID = params.roomID as string;

  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [gameState, setGameStateData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMyTurn, setIsMyTurn] = useState(false);

  // Initialize single-player vs AI game
  useEffect(() => {
    const initGame = async () => {
      try {
        if (!user) throw new Error('User not authenticated');

        // Create player and AI opponent
        const playerData: GamePlayer = {
          uid: user.uid,
          name: user.displayName || 'Player',
          photoURL: (user.googlePhotoURL || user.firebasePhotoURL) as string | undefined,
          joinedAt: new Date().toISOString(),
        };

        const aiOpponent: GamePlayer = {
          uid: 'ai-opponent-1',
          name: 'AI Opponent',
          photoURL: undefined,
          joinedAt: new Date().toISOString(),
        };

        const playersData = [playerData, aiOpponent];
        setPlayers(playersData);

        // Get questions and initialize game
        const questions = await getQuestions(topicID);
        const shuffledQuestions = shuffle(questions);

        await initializeNusaCardGameState(topicID, gameID, roomID, playersData, shuffledQuestions);
        await setGameStatus(topicID, gameID, roomID, 'playing');

        setLoading(false);
      } catch (error) {
        console.error('Error initializing NusaCard vs AI:', error);
        router.push(`/lobby/${topicID}/${gameID}`);
      }
    };

    initGame();
  }, [gameID, topicID, roomID, user, router]);

  // Subscribe to game state
  useEffect(() => {
    if (loading) return;

    const unsubscribe = subscribeToGameState(topicID, gameID, roomID, (state) => {
      if (state) {
        setGameStateData(state);
        setIsMyTurn(state.currentPlayerIndex === 0); // Player is always index 0
      }
    });

    return () => unsubscribe();
  }, [loading, topicID, gameID, roomID]);

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
        <p>My Turn: {isMyTurn ? 'Yes' : 'No'}</p>

        {/* Game Component will be rendered here */}
        <div className="alert alert-info mt-4">
          NusaCard game component - Single player vs AI mode
        </div>
      </div>
      <Footer />
    </main>
  );
}
