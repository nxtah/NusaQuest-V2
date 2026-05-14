// Re-export from firestore
export type { User, Achievement } from "./firestore";

/**
 * User Update Request
 */
export interface UpdateUserRequest {
  displayName?: string;
  photoURL?: string;
}

/**
 * User Profile (public view, without sensitive data)
 */
export interface UserProfile {
  userId: string;
  displayName: string;
  photoURL: string;
  totalPoints: number;
  totalGamesPlayed: number;
  totalWins: number;
  winRate: number; // totalWins / totalGamesPlayed
}

/**
 * User Stats
 */
export interface UserStats {
  userId: string;
  totalPoints: number;
  totalGamesPlayed: number;
  totalWins: number;
  winRate: number;
  averageScore: number;
  favoriteMap?: string;
  favoriteRegion?: string;
  longestStreak: number; // consecutive wins
  achievements: number; // count of unlocked
}

/**
 * Leaderboard Entry
 */
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  photoURL: string;
  points: number;
  wins: number;
}

/**
 * Leaderboard Filter
 */
export interface LeaderboardFilter {
  period?: "allTime" | "monthly" | "weekly";
  limit?: number;
  offset?: number;
}

/**
 * User Inventory Item
 */
export interface InventoryItem {
  itemId: string;
  name: string;
  description: string;
  type: "potion" | "boost" | "power-up";
  effect: string; // e.g., "hint", "freeze", "extra_time"
  quantity: number;
  imageUrl?: string;
}

/**
 * User Potion (specific type of inventory)
 */
export interface UserPotion extends InventoryItem {
  type: "potion";
}

/**
 * Achievement Definition
 */
export interface AchievementDefinition {
  achievementId: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  rewardPoints: number;
}

/**
 * User Achievement (unlocked)
 */
export interface UserAchievement extends AchievementDefinition {
  unlockedAt: number;
  progress: number; // for progressive achievements
}

/**
 * Achievement Progress
 */
export interface AchievementProgress {
  achievementId: string;
  currentProgress: number;
  requiredProgress: number;
  isUnlocked: boolean;
  unlockedAt?: number;
}
