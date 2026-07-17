// ========================
// Core Domain Types
// ========================

/**
 * Map/Category - represents one of the 5 game categories
 */
export interface GameMap {
  mapId: string;
  name: string; // e.g., "🍜 Kuliner Tradisional"
  icon: string;
  description: string;
  order: number;
  isActive: boolean;
  createdAt: number;
}

/**
 * Region - represents a province/region within a map
 */
export interface Region {
  regionId: string;
  name: string; // e.g., "Jawa Barat"
  mapId: string; // foreign key to maps
  code: string; // e.g., "jw" - URL friendly
  description: string;
  isActive: boolean;
  createdAt: number;
}

/**
 * Question - represents a multiple choice question
 */
export interface Question {
  questionId: string;
  regionId: string;
  mapId: string;
  text: string;
  options: [string, string, string, string]; // exactly 4 options
  correctIndex: 0 | 1 | 2 | 3; // index of correct answer
  difficulty: "easy"; // reserved for future
  isActive: boolean;
  isApproved: boolean; // admin review status
  generatedBy: "ai" | "manual";
  createdAt: number;
  approvedAt?: number;
  approvedBy?: string; // admin uid
}

/**
 * User Profile & Stats
 */
export interface User {
  userId: string; // Firebase Auth uid
  email: string;
  displayName: string;
  photoURL: string;
  totalPoints: number;
  totalGamesPlayed: number;
  totalWins: number;
  lastLoginAt: number;
  createdAt: number;
  inventory: Record<string, number>; // item_id -> count
  achievements: Record<string, Achievement>;
}

/**
 * Achievement - unlocked by user
 */
export interface Achievement {
  unlockedAt: number;
  progress: number;
}

/**
 * Player in a room
 */
export interface RoomPlayer {
  joinedAt: number;
  role: "host" | "player" | "ai";
  isActive: boolean; // false if eliminated
  finalPosition?: number; // null if still playing
  name?: string;
  photoURL?: string;
}

/**
 * Room - represents a game session (multiplayer or vs AI)
 */
export interface Room {
  roomId: string;
  gameType: "ular-tangga" | "nusa-card";
  mapId: string;
  regionId: string;
  maxPlayers: number; // 4 for multiplayer, 1 for vs AI
  currentPlayers: number;
  status: "waiting" | "playing" | "finished";
  players: Record<string, RoomPlayer>; // userId -> player data
  createdAt: number;
  startedAt?: number;
  finishedAt?: number;
  totalQuestionsUsed: number;
}

/**
 * Player State during active game
 */
export interface PlayerGameState {
  score: number;
  position: number; // for ular tangga board position
  correctAnswers: number;
  wrongAnswers: number;
  isWaiting: boolean;
  lastAction: number;
}

/**
 * Real-time game state
 */
export interface GameState {
  roomId: string;
  currentPlayerIndex: number;
  round: number;
  turnStartedAt: number;
  playerStates: Record<string, PlayerGameState>; // userId -> state
  questionsUsed: string[]; // questionIds
  winner?: string; // userId, null if not finished
  updatedAt: number;
}

/**
 * Player result after game ends
 */
export interface PlayerResult {
  userId: string;
  position: number;
  score: number;
  correctAnswers: number;
  pointsEarned: number;
}

/**
 * Game Result - saved after game completes
 */
export interface GameResult {
  resultId: string;
  roomId: string;
  gameType: "ular-tangga" | "nusa-card";
  mapId: string;
  regionId: string;
  finalRanking: PlayerResult[];
  totalDuration: number; // in seconds
  totalQuestionsUsed: number;
  createdAt: number;
  winner: string; // userId
}

/**
 * Admin Log Entry
 */
export interface AdminLog {
  logId: string;
  adminUid: string;
  action: string; // "create_question" | "approve_question" | etc
  targetType: "question" | "region" | "map";
  targetId: string;
  details: Record<string, any>;
  createdAt: number;
}

// ========================
// API Request/Response Types
// ========================

/**
 * Request to generate questions via AI
 */
export interface AIQuestionGenerationRequest {
  regionId: string;
  mapId: string;
  count: number;
  customPrompt?: string;
}

/**
 * Response from AI question generation
 */
export interface AIQuestionGenerationResponse {
  questions: Omit<Question, "questionId" | "isApproved" | "approvedAt" | "approvedBy" | "createdAt">[];
  status: "success" | "error";
  message?: string;
}

/**
 * Request to approve/reject questions
 */
export interface QuestionApprovalRequest {
  questionId: string;
  isApproved: boolean;
  adminUid: string;
}

// ========================
// Filter/Query Types
// ========================

/**
 * Filter for questions query
 */
export interface QuestionFilter {
  regionId?: string;
  mapId?: string;
  isApproved?: boolean;
  generatedBy?: "ai" | "manual";
  limit?: number;
}

/**
 * Filter for regions query
 */
export interface RegionFilter {
  mapId?: string;
  isActive?: boolean;
}

// ========================
// Utility Types
// ========================

/**
 * Generic document response from Firestore
 */
export type FirestoreDoc<T> = T & {
  _id?: string;
  _createdAt?: number;
  _updatedAt?: number;
};

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  status: "success" | "error";
  message?: string;
  meta?: PaginationMeta;
}
