export type UserRole = 'user' | 'admin';

export interface UserInventory {
  potion: number;
}

export interface UserBadges {
  gold: number;
  silver: number;
  bronze: number;
}

export interface UserStats {
  /** Menang beruntun (rank 1 NusaCard / menang Ular Tangga) — reset ke 0
      begitu 1 game berakhir tanpa menang. */
  winStreak: number;
}

export interface UserAchievements {
  /** Pernah menang dalam waktu kurang dari 10 menit. */
  speedRun: boolean;
  /** Pernah menang 3x berturut-turut. */
  streak: boolean;
}

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  googlePhotoURL?: string | null;
  firebasePhotoURL?: string | null;
  role: UserRole;
  /** Skill item — "potion" bisa dipake buat auto-jawab-benar (skip) 1
      pertanyaan di NusaCard/Ular Tangga. Akun baru mulai dengan 1. */
  inventory: UserInventory;
  /** Jumlah kali dapet peringkat 1/2/3 di NusaCard atau menang di Ular
      Tangga (Ular Tangga cuma pernah ngisi `gold`, gak ada peringkat 2/3
      di situ — bukan bug, emang aturan mainnya menang-kalah doang). */
  badges: UserBadges;
  stats: UserStats;
  achievements: UserAchievements;
  /** Udah pernah liat popup perkenalan NusaQuest — akun baru mulai `false`
      (nampilin popup sekali), akun lama di-backfill `true` (gak nongol
      tiba-tiba buat yang udah lama main). */
  hasSeenIntro: boolean;
}

export interface AuthClaims {
  uid: string;
  email?: string;
  role?: UserRole;
  admin?: boolean;
  iat?: number;
  exp?: number;
}

export interface AuthSession {
  user: AppUser | null;
  isLoggedIn: boolean;
  isInitialized: boolean;
}

export interface AuthContextValue extends AuthSession {
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}
