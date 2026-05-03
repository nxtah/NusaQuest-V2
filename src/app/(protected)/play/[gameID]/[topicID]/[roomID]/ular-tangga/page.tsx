"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import GameBackground from '../../../../../../../features/game-ular-tangga/components/GameBackground';
import Board from '../../../../../../../features/game-ular-tangga/components/Board';
import PlayerTurnBox from '../../../../../../../features/game-ular-tangga/components/PlayerTurnBox';
import { questionBank } from '../../../../../../../features/game-ular-tangga/data/questions';
import { ularTangga } from '../../../../../../../assets/images/ular-tangga/cloudinaryAssets';
import type { DiceState } from '../../../../../../../features/game-ular-tangga/components/Dice';
import RotateDeviceOverlay from '../../../../../../../components/layout/RotateDeviceOverlay';
import PauseModal from "../../../../../../../features/game-ular-tangga/components/PauseModal";
import SettingButton from "../../../../../../../features/game-ular-tangga/components/SettingButton";

export default function Page() {
  const router = useRouter();
  const params = useParams();

  const [isPaused, setIsPaused] = useState(false);

  const [players] = useState([
    { id: 1, avatar: ularTangga.pion1, name: 'Pemain A' },
    { id: 2, avatar: ularTangga.pion2, name: 'Pemain B' },
    { id: 3, avatar: ularTangga.pion3, name: 'Pemain C' },
    { id: 4, avatar: ularTangga.pion4, name: 'Pemain D' },
  ]);

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [focusedPlayerIndex, setFocusedPlayerIndex] = useState<number | null>(null);
  const [focusedPlayerName, setFocusedPlayerName] = useState<string | null>(null);

  const [diceState, setDiceState] = useState<DiceState | undefined>(undefined);
  const [showQuestion, setShowQuestion] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);

  const myPlayerId = 'player-1'; // Current player

  const onDiceRollComplete = (num: number, isUserAction: boolean) => {
    if (isUserAction) {
      // User clicked roll -> set diceState (parent controls animation)
      setDiceState({ isRolling: true, currentNumber: num, rollingPlayerId: 'player-1' });
      setFocusedPlayerIndex(0);
      setFocusedPlayerName(players[0].name ?? null);
      setShowQuestion(false);

      // After animation completes (1s), tell parent to show question
      setTimeout(() => {
        setDiceState((prev) =>
          prev ? { ...prev, isRolling: false, currentNumber: num } : undefined
        );
      }, 1000);
    } else {
      // Animation complete callback from Dice component
      setShowQuestion(true);
      setSelectedAnswerIndex(null);

      // Clear focused player after delay
      setTimeout(() => {
        setFocusedPlayerIndex(null);
        setFocusedPlayerName(null);
      }, 1400);
    }
  };

  const onSelectAnswer = (index: number) => {
    setSelectedAnswerIndex(index);

    const isCorrect = index === currentQuestion.correctIndex;

    if (isCorrect) {
      // Correct answer: go to next player after a short delay
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
        setShowQuestion(false);
        setSelectedAnswerIndex(null);
        setDiceState(undefined);
        setFocusedPlayerIndex(null);
        setFocusedPlayerName(null);
        // Move to next player's turn
        const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
        setCurrentPlayerIndex(nextPlayerIndex);
      }, 1500);
    } else {
      // Wrong answer: immediately go to next player (no board movement)
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
        setShowQuestion(false);
        setSelectedAnswerIndex(null);
        setDiceState(undefined);
        setFocusedPlayerIndex(null);
        setFocusedPlayerName(null);
        // Move to next player's turn
        const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
        setCurrentPlayerIndex(nextPlayerIndex);
      }, 1000);
    }
  };

  // Auto-simulate other players rolling (demo mode)
  useEffect(() => {
    if (currentPlayerIndex !== 0 && !diceState?.isRolling && !showQuestion) {
      // Other player's turn - simulate rolling after 1.5s
      const autoRollTimer = setTimeout(() => {
        const randomNumber = Math.floor(Math.random() * 6) + 1;
        setDiceState({ isRolling: true, currentNumber: randomNumber, rollingPlayerId: `player-${currentPlayerIndex + 1}` });
        setFocusedPlayerIndex(currentPlayerIndex);
        setFocusedPlayerName(players[currentPlayerIndex].name ?? null);
      }, 1500);

      return () => clearTimeout(autoRollTimer);
    }
  }, [currentPlayerIndex, diceState, showQuestion, players]);

  const currentQuestion = questionBank[currentQuestionIndex % questionBank.length];

  // Auto-answer for other players (demo mode)
  useEffect(() => {
    if (currentPlayerIndex !== 0 && showQuestion && selectedAnswerIndex === null) {
      // Other player's turn - auto-answer after 2s
      const autoAnswerTimer = setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * currentQuestion.options.length);
        onSelectAnswer(randomIndex);
      }, 2000);

      return () => clearTimeout(autoAnswerTimer);
    }
  }, [currentPlayerIndex, showQuestion, selectedAnswerIndex, currentQuestion]);

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden">
      {/* Overlay untuk Rotasi Perangkat */}
      <RotateDeviceOverlay />

      {/* Background Image */}
      <div className="fixed inset-0 -z-10 bg-[#59a87d]">
        <GameBackground />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start lg:items-center justify-center min-h-[100svh] pt-2 md:pt-4 lg:pt-8 pb-0 px-2 md:px-5 lg:px-8 w-full max-w-[1400px] mx-auto">
        {/* Tombol Back */}
        <button 
            onClick={() => router.push(`/room/${params?.gameID}/${params?.topicID}/${params?.roomID}`)}
            className="absolute left-10 lg:left-7 top-7 z-50 text-white transition-transform"
          >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        {/* Setting Button */}
        <SettingButton onClick={() => setIsPaused(true)} />

        {/* Left Section - Board */}
        <div className="flex-1 w-full flex items-start justify-center z-20 mt-1 md:mt-2 lg:mt-0">
          <div className="w-full aspect-square max-w-[80vh] md:max-w-[75vh] lg:max-w-[80vh] ml-4 md:ml-12 lg:ml-4">
            <Board />
          </div>
        </div>

        {/* Right Section - Player Turn */}
        <div className="flex-1 w-full flex flex-col justify-start lg:justify-center items-center h-full">
          <div className="w-full flex-col flex items-center max-w-[85vmin] md:max-w-[70vh] lg:max-w-[75vh]">
            <PlayerTurnBox
              players={players}
              currentPlayerIndex={currentPlayerIndex}
              focusedPlayerIndex={focusedPlayerIndex ?? undefined}
              focusedPlayerName={focusedPlayerName}
              isMyTurn={currentPlayerIndex === 0}
              diceState={diceState}
              onDiceRollComplete={onDiceRollComplete}
              question={showQuestion ? { ...currentQuestion, selectedIndex: selectedAnswerIndex, isCorrectIndex: currentQuestion.correctIndex } : null}
              showQuestion={showQuestion}
              onSelectAnswer={onSelectAnswer}
              myPlayerId={myPlayerId}
            />
          </div>
        </div>

        <PauseModal 
            isOpen={isPaused}               
            onClose={() => setIsPaused(false)} 
        />
      </div>
    </main>
  );
}
