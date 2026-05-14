import type { GameState, Question } from "@/src/types/firestore";

/**
 * Card Rarity Type
 */
export type CardRarity = "common" | "rare" | "epic" | "legendary";

/**
 * Nusa Card (individual card in game)
 */
export interface NusaCard {
  cardId: string;
  question: Question;
  rarity: CardRarity;
  pointValue: number;
  image?: string;
}

/**
 * Card Points by Rarity
 */
export const CARD_POINT_VALUES: Record<CardRarity, number> = {
  common: 10,
  rare: 25,
  epic: 50,
  legendary: 100,
};

/**
 * Nusa Card Game State (extends generic GameState)
 */
export interface NusaCardState extends GameState {
  deck: NusaCard[]; // remaining cards
  cardsPlayed: NusaCard[]; // cards already used
  playerHands: Record<string, NusaCard[]>; // userId -> cards in hand
  maxHandSize: number; // usually 5
  discardPile: NusaCard[];
}

/**
 * Card Play Action
 */
export interface CardPlayAction {
  userId: string;
  cardId: string;
  timestamp: number;
  questionAnswered: boolean;
  isCorrect: boolean;
  pointsEarned: number;
}

/**
 * Player Hand
 */
export interface PlayerHand {
  userId: string;
  cards: NusaCard[];
  maxCards: number;
  currentCardCount: number;
}

/**
 * Card Deal Event
 */
export interface CardDealEvent {
  userId: string;
  cards: NusaCard[];
  totalInHand: number;
  timestamp: number;
}

/**
 * Nusa Card Round
 */
export interface NusaCardRound {
  roundNumber: number;
  startedAt: number;
  endedAt?: number;
  actions: CardPlayAction[];
  playerOrder: string[]; // userIds
}

/**
 * Nusa Card Game Result
 */
export interface NusaCardResult {
  roomId: string;
  ranking: Array<{
    rank: number;
    userId: string;
    displayName: string;
    totalScore: number;
    correctAnswers: number;
    wrongAnswers: number;
    cardsPlayed: number;
    finalPoints: number;
  }>;
  totalRounds: number;
  totalCardsInDeck: number;
  cardsUsed: number;
  gameDuration: number; // seconds
  winner: string; // userId
  completedAt: number;
}

/**
 * Deck Configuration
 */
export interface DeckConfig {
  initialDeckSize: number;
  cardsPerPlayer: number;
  maxHandSize: number;
  drawCardsPerTurn: number;
  minPlayersToStart: number;
}

/**
 * Default Deck Config
 */
export const DEFAULT_DECK_CONFIG: DeckConfig = {
  initialDeckSize: 50,
  cardsPerPlayer: 5,
  maxHandSize: 5,
  drawCardsPerTurn: 2,
  minPlayersToStart: 2,
};
