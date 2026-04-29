'use client';

import React, { ReactNode } from 'react';
import InitialPanel from './InitialPanel';
import QuestionPanel from './QuestionPanel';
import PlayerList from './PlayerList';
import Dice, { DiceState } from './Dice';

interface Player {
  id: number;
  name?: string;
  avatar: string;
}

interface PlayerTurnBoxProps {
  children?: ReactNode;
  diceState?: DiceState | undefined;
  isMyTurn?: boolean;
  onDiceRollComplete?: (num: number, isUserAction: boolean) => void;
  onSelectAnswer?: (index: number) => void;
  question?: {
    text: string;
    options: string[];
    selectedIndex?: number | null;
    isCorrectIndex?: number | null;
  } | null;
  showQuestion?: boolean;
  players?: Player[];
  currentPlayerIndex?: number;
  focusedPlayerIndex?: number | null;
  focusedPlayerName?: string | null;
  myPlayerId?: string;
}

export default function PlayerTurnBox({
  children,
  diceState,
  isMyTurn = true,
  onDiceRollComplete,
  onSelectAnswer,
  question = null,
  showQuestion = false,
  players,
  currentPlayerIndex = 0,
  focusedPlayerIndex = null,
  focusedPlayerName = null,
  myPlayerId,
}: PlayerTurnBoxProps) {
  return (
    <div className="absolute right-0 top-0 h-full w-1/2 overflow-hidden px-3 py-3 md:px-6 md:py-6 flex justify-center">
      <div className="flex h-full w-full max-w-[620px] flex-col items-center justify-between gap-3 md:gap-4">
        {/* Question or Initial Panel */}
        <div className="w-full flex justify-center shrink-0">
          {showQuestion && question ? (
            <QuestionPanel
              questionText={question.text}
              options={question.options}
              selectedIndex={question.selectedIndex ?? null}
              isCorrectIndex={question.isCorrectIndex ?? null}
              onSelectOption={onSelectAnswer}
            />
          ) : (
            <InitialPanel focusedName={focusedPlayerName} />
          )}
        </div>

        {/* Dice Component */}
        <div className="flex shrink-0 items-center justify-center">
          <Dice
            onRollComplete={onDiceRollComplete ?? (() => {})}
            diceState={diceState}
            isMyTurn={isMyTurn}
            disabled={false}
            myPlayerId={myPlayerId}
          />
        </div>

        {/* Players Section */}
        <div className="shrink-0 w-full flex items-center justify-center pb-1 md:pb-2">
          {children ?? (
            <PlayerList
              players={players}
              currentPlayerIndex={currentPlayerIndex}
              focusedPlayerIndex={focusedPlayerIndex ?? undefined}
              focusedName={focusedPlayerName ?? undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
}
