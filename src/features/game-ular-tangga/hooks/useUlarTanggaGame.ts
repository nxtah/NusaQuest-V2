import { useState, useEffect, useCallback } from 'react';
import {
  UlarTanggaGameState,
  listenToGameState,
  updateGameState,
  movePawn,
  submitAnswer,
  nextTurn,
} from '../services/ular-tangga-game.service';

export function useUlarTanggaGame(
  topicID: string,
  gameID: string,
  roomID: string,
  userUID: string,
) {
  const [gameState, setGameState] = useState<UlarTanggaGameState | null>(null);

  // Listen to game state
  useEffect(() => {
    if (!topicID || !gameID || !roomID) return;
    const unsubscribe = listenToGameState(topicID, gameID, roomID, (state) => {
      setGameState(state);
    });
    return () => unsubscribe();
  }, [topicID, gameID, roomID]);

  /**
   * Mengocok dadu
   */
  const rollDice = useCallback(async () => {
    if (!gameState || gameState.isMoving || gameState.showQuestion) return;
    
    // Pastikan ini giliran user
    const playerIndex = gameState.currentPlayerIndex;
    // Logic pengecekan userUID vs playerUID bisa ditambahkan di sini
    
    const steps = Math.floor(Math.random() * 6) + 1;
    
    // Update state dadu sedang berputar
    await updateGameState(topicID, gameID, roomID, {
      diceState: {
        isRolling: true,
        currentNumber: steps,
        lastRoll: steps,
      },
    });

    // Simulasi delay dadu berputar
    setTimeout(async () => {
      await updateGameState(topicID, gameID, roomID, {
        diceState: {
          isRolling: false,
          currentNumber: steps,
          lastRoll: steps,
        },
      });
      
      // Jalankan gerakan pion
      await movePawn(topicID, gameID, roomID, playerIndex, steps);
    }, 1000);
  }, [gameState, topicID, gameID, roomID]);

  /**
   * Menjawab pertanyaan
   */
  const answerQuestion = useCallback(async (selectedIndex: number) => {
    if (!gameState || !gameState.waitingForAnswer) return;

    await submitAnswer(topicID, gameID, roomID, selectedIndex);

    // Beri jeda 2 detik agar user bisa melihat highlight (Green/Red)
    setTimeout(async () => {
      await nextTurn(topicID, gameID, roomID);
    }, 2000);
  }, [gameState, topicID, gameID, roomID]);

  return {
    gameState,
    rollDice,
    answerQuestion,
  };
}
