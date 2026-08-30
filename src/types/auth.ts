export type UserRole = 'user' | 'admin';

export interface UserInventory {
  potion: number;
}

export interface UserBadges {
  gold: number;
  silver: number;
  bronze: number;
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
