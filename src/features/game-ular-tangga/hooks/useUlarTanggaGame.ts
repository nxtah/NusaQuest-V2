import {useState, useEffect, useCallback} from 'react';
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
   * ===== PERBAIKI: Validasi UID sebelum roll =====
   */
  const rollDice = useCallback(async () => {
    if (!gameState || gameState.isMoving || gameState.showQuestion || gameState.waitingForAnswer) return;

    // ===== VALIDASI 1: CEK APAKAH INI GILIRAN USER =====
    if (gameState.currentPlayerUID !== userUID) {
      console.warn(`[ROLL] Ini bukan giliran Anda! Giliran pemain: ${gameState.currentPlayerUID}, Anda: ${userUID}`);
      return; // JANGAN ALLOW roll
    }

    // ===== VALIDASI 2: CEK DADU SUDAH SELESAI =====
    if (gameState.diceState?.isRolling) {
      console.warn('[ROLL] Dadu masih berputar, tunggu selesai');
      return; // JANGAN ALLOW roll lagi
    }

    const steps = Math.floor(Math.random() * 6) + 1;

    console.log(`[ROLL] User ${userUID} roll dadu: ${steps}`);

    // Update state dadu sedang berputar
    await updateGameState(topicID, gameID, roomID, {
      isMoving: true,
      diceState: {
        isRolling: true,
        currentNumber: steps,
        lastRoll: steps,
        rollingPlayerId: userUID,
      },
    });

    // Simulasi delay dadu berputar
    setTimeout(async () => {
      await updateGameState(topicID, gameID, roomID, {
        isMoving: false,
        diceState: {
          isRolling: false,
          currentNumber: steps,
          lastRoll: steps,
          rollingPlayerId: userUID,
        },
      });

      // Jalankan gerakan pion
      await movePawn(topicID, gameID, roomID, gameState.currentPlayerIndex, steps);
    }, 1000);
  }, [gameState, topicID, gameID, roomID, userUID]);

  /**
   * Menjawab pertanyaan
   * ===== PERBAIKI: Pass userUID untuk validasi =====
   */
  const answerQuestion = useCallback(async (selectedIndex: number) => {
    if (!gameState || !gameState.waitingForAnswer || gameState.currentPlayerUID !== userUID) {
      console.warn('[ANSWER] Tidak bisa jawab: bukan giliran Anda atau sudah ditutup');
      return; // BLOCK jawaban jika bukan giliran
    }

    await submitAnswer(topicID, gameID, roomID, selectedIndex, userUID); // ===== TAMBAH: Pass userUID =====

    // Beri jeda 2 detik agar user bisa melihat highlight (Green/Red)
    setTimeout(async () => {
      await nextTurn(topicID, gameID, roomID);
    }, 2000);
  }, [gameState, topicID, gameID, roomID, userUID]);

  return {
    gameState,
    rollDice,
    answerQuestion,
    isMyTurn: gameState?.currentPlayerUID === userUID, // ===== TAMBAH: Flag untuk disable UI =====
  };
}
