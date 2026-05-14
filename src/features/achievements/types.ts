/**
 * Achievement Definition
 */
export interface AchievementDef {
  achievementId: string;
  name: string;
  description: string;
  icon: string;
  category: "game" | "milestone" | "exploration" | "special";
  requirement: {
    type: "count" | "streak" | "score" | "unlock";
    target: number;
  };
  rewardPoints: number;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
}

/**
 * User Achievement (progress tracking)
 */
export interface UserAchievementProgress {
  achievementId: string;
  userId: string;
  currentProgress: number;
  requiredProgress: number;
  isUnlocked: boolean;
  unlockedAt?: number;
}

/**
 * Achievement Unlock Event
 */
export interface AchievementUnlockEvent {
  userId: string;
  achievementId: string;
  unlockedAt: number;
  rewardPoints: number;
}

/**
 * Common Achievements (pre-defined)
 */
export const COMMON_ACHIEVEMENTS: Record<string, AchievementDef> = {
  first_win: {
    achievementId: "first_win",
    name: "Juara Pemula",
    description: "Menangkan permainan pertama Anda",
    icon: "🏆",
    category: "milestone",
    requirement: { type: "count", target: 1 },
    rewardPoints: 50,
    rarity: "common",
  },
  10_wins: {
    achievementId: "10_wins",
    name: "Petualang Sejati",
    description: "Menangkan 10 permainan",
    icon: "⭐",
    category: "milestone",
    requirement: { type: "count", target: 10 },
    rewardPoints: 200,
    rarity: "uncommon",
  },
  50_wins: {
    achievementId: "50_wins",
    name: "Master Penjelajah",
    description: "Menangkan 50 permainan",
    icon: "👑",
    category: "milestone",
    requirement: { type: "count", target: 50 },
    rewardPoints: 500,
    rarity: "rare",
  },
  explore_all_maps: {
    achievementId: "explore_all_maps",
    name: "Penjelajah Nusantara",
    description: "Mainkan game di semua 5 kategori",
    icon: "🗺️",
    category: "exploration",
    requirement: { type: "count", target: 5 },
    rewardPoints: 300,
    rarity: "epic",
  },
  perfect_streak: {
    achievementId: "perfect_streak",
    name: "Tidak Terkalahkan",
    description: "Menangkan 5 permainan berturut-turut",
    icon: "🔥",
    category: "special",
    requirement: { type: "streak", target: 5 },
    rewardPoints: 400,
    rarity: "epic",
  },
  all_correct: {
    achievementId: "all_correct",
    name: "Genius",
    description: "Jawab semua pertanyaan dengan benar dalam satu permainan",
    icon: "🧠",
    category: "special",
    requirement: { type: "count", target: 1 },
    rewardPoints: 250,
    rarity: "legendary",
  },
};
