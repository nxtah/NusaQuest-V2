'use client';

import React, {ReactNode} from 'react';
import InitialPanel from './InitialPanel';
import QuestionPanel from './QuestionPanel';
import PlayerList from './PlayerList';
import Dice, {DiceState} from './Dice';

interface Player {
  id: number;
  name?: string;
  avatar: string;
}

interface PlayerTurnBoxProps {
  children?: ReactNode;
  diceState?: DiceState | undefined;
  isMyTurn?: boolean;
  disabled?: boolean;
  onDiceRollStart?: (num: number) => void;
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
  disabled = false,
  onDiceRollStart,
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
    <div className="w-full flex justify-center">
      <div className="flex w-full max-w-[620px] flex-col items-center justify-center gap-0 lg:gap-8">
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
        <div className="flex shrink-0 items-center justify-center relative z-10 lg:mt-0">
          <Dice
            onRollStart={onDiceRollStart}
            onRollComplete={onDiceRollComplete ?? (() => { })}
            diceState={diceState}
            isMyTurn={isMyTurn}
            disabled={disabled}
            myPlayerId={myPlayerId}
          />
        </div>

        {/* Players Section */}
        <div className="shrink-0 w-full flex items-center justify-center pb-1 lg:pb-2 relative z-20 lg:mt-0">
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
