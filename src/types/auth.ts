export type UserRole = 'user' | 'admin';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  googlePhotoURL?: string | null;
  firebasePhotoURL?: string | null;
  role: UserRole;
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
