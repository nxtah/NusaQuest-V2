import { Question, GameState, PlayerGameState } from "./firestore";

/**
 * Game Type
 */
export type GameType = "ular-tangga" | "nusa-card";

/**
 * Game Mode
 */
export type GameMode = "multiplayer" | "vs-ai";

/**
 * Ular Tangga specific state
 */
export interface UlarTanggaGameState extends GameState {
  boardSize: number; // total squares on board (usually 100)
  ladders: Record<number, number>; // position -> next position
  snakes: Record<number, number>; // position -> next position
}

/**
 * Nusa Card specific state
 */
export interface NusaCardGameState extends GameState {
  deck: string[]; // card ids in deck
  cardsUsed: string[]; // cards already used
}

/**
 * Game Answer/Response
 */
export interface GameAnswer {
  questionId: string;
  userId: string;
  selectedIndex: number; // 0-3
  isCorrect: boolean;
  timeSpent: number; // in seconds
  pointsEarned: number;
}

/**
 * AI Player Config
 */
export interface AIPlayerConfig {
  name: string;
  difficulty: "easy" | "medium" | "hard";
  correctRate: number; // 0.3 to 0.9
  responseTime: number; // in ms (500-3000)
}

/**
 * Default AI players for vs-ai mode
 */
export const DEFAULT_AI_PLAYERS: Record<string, AIPlayerConfig> = {
  ai_1: {
    name: "Bot Pintar",
    difficulty: "medium",
    correctRate: 0.65,
    responseTime: 1500,
  },
  ai_2: {
    name: "Bot Cerdas",
    difficulty: "hard",
    correctRate: 0.8,
    responseTime: 1000,
  },
  ai_3: {
    name: "Bot Bodoh",
    difficulty: "easy",
    correctRate: 0.4,
    responseTime: 2000,
  },
};

/**
 * Ular Tangga Dice Roll
 */
export interface DiceRoll {
  userId: string;
  value: number; // 1-6
  timestamp: number;
  newPosition: number; // after snake/ladder
  isLadderUsed: boolean;
  isSnakeHit: boolean;
}

/**
 * Ular Tangga Question Challenge
 */
export interface UlarTanggaChallenge {
  position: number;
  question: Question;
  status: "pending" | "answered" | "timeout";
  selectedAnswerIndex?: number;
  isCorrect?: boolean;
}

/**
 * Nusa Card Card
 */
export interface NusaCard {
  cardId: string;
  question: Question;
  rarity: "common" | "rare" | "epic" | "legendary";
  pointValue: number;
}

/**
 * Nusa Card Hand (cards in player's hand)
 */
export interface NusaCardHand {
  userId: string;
  cards: NusaCard[];
  maxCards: number;
}

/**
 * Nusa Card Play Action
 */
export interface NusaCardPlayAction {
  userId: string;
  cardId: string;
  timestamp: number;
  isCorrect: boolean;
  pointsEarned: number;
}

/**
 * Game Round for turn-based games
 */
export interface GameRound {
  roundNumber: number;
  currentPlayerIndex: number;
  startedAt: number;
  endedAt?: number;
  actions: GameAnswer[];
}

/**
 * Game Event (for real-time updates)
 */
export interface GameEvent {
  type:
    | "player_joined"
    | "player_left"
    | "player_answered"
    | "game_started"
    | "game_ended"
    | "round_started"
    | "round_ended"
    | "player_eliminated";
  roomId: string;
  userId: string;
  data: Record<string, any>;
  timestamp: number;
}
