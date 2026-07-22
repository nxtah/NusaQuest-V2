import type { GameState, PlayerGameState, Question } from "@/src/types/firestore";

/**
 * Ular Tangga Board Configuration
 */
export interface BoardConfig {
  totalSquares: number; // usually 100
  ladders: Record<number, number>; // from -> to
  snakes: Record<number, number>; // from -> to
}

/**
 * Ular Tangga Game State (extends generic GameState)
 */
export interface UlarTanggaState extends GameState {
  boardConfig: BoardConfig;
  playerPositions: Record<string, number>; // userId -> boardPosition
  currentDiceValue?: number;
  lastDiceRollAt?: number;
}

/**
 * Pion (Game Piece) Position
 */
export interface PionPosition {
  userId: string;
  displayName: string;
  position: number; // 0-100
  reachedFinish: boolean;
  eliminatedAt?: number;
}

/**
 * Dice Roll Action
 */
export interface DiceRollAction {
  userId: string;
  value: number; // 1-6
  timestamp: number;
  newPosition: number;
  message: string; // "Naik tangga!" or "Kena ular!" or "Berdiri di posisi X"
}

/**
 * Question Challenge (triggered at board position)
 */
export interface QuestionChallenge {
  challengeId: string;
  position: number; // which board position triggered this
  question: Question;
  userId: string; // whose turn
  status: "pending" | "answered" | "timeout" | "skipped";
  selectedAnswer?: number; // 0-3
  isCorrect?: boolean;
  timeLimit: number; // seconds
  startedAt: number;
  endedAt?: number;
}

/**
 * Turn Result
 */
export interface TurnResult {
  userId: string;
  diceValue: number;
  newPosition: number;
  questionAsked: boolean;
  questionCorrect?: boolean;
  messageToDisplay: string;
  pointsEarned: number;
}

/**
 * Ular Tangga Round
 */
export interface UlarTanggaRound {
  roundNumber: number;
  playerOrder: string[]; // userIds in turn order
  startedAt: number;
  endedAt?: number;
  turns: Array<{
    userId: string;
    diceValue: number;
    newPosition: number;
    timestamp: number;
  }>;
  completedTurns: number;
}

/**
 * Ular Tangga Game Result
 */
export interface UlarTanggaResult {
  roomId: string;
  finalPositions: Record<string, number>; // userId -> finalBoardPosition
  ranking: Array<{
    rank: number;
    userId: string;
    displayName: string;
    finalPosition: number;
    totalDiceRolls: number;
    correctAnswers: number;
    wrongAnswers: number;
    pointsEarned: number;
  }>;
  totalRounds: number;
  gameDuration: number; // seconds
  winner: string; // userId
  completedAt: number;
}

/**
 * Ular Tangga Board Rendering Data
 */
export interface BoardRenderData {
  squares: Array<{
    position: number;
    hasLadderStart: boolean;
    hasSnakeStart: boolean;
    ladderEnd?: number;
    snakeEnd?: number;
  }>;
  pions: Array<{
    userId: string;
    displayName: string;
    position: number;
    color: string;
    isEliminated: boolean;
  }>;
  currentPlayerIndex: number;
}
