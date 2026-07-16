<<<<<<< HEAD
import { User } from "./firestore";

/**
 * Auth Session - current logged in user
 */
export interface AuthSession {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error?: string;
}

/**
 * Auth Context Value
 */
export interface AuthContextType {
  session: AuthSession;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (displayName: string, photoURL: string) => Promise<void>;
}

/**
 * Firebase Auth User (before mapping to Firestore User)
 */
export interface FirebaseAuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
  providerData: Array<{
    uid: string;
    displayName: string | null;
    email: string | null;
    phoneNumber: string | null;
    photoURL: string | null;
    providerId: string;
  }>;
  phoneNumber: string | null;
  isAdmin?: boolean;
}

/**
 * Login Response
 */
export interface LoginResponse {
  user: User;
  isNewUser: boolean;
}

/**
 * Admin whitelist entry
 */
export interface AdminConfig {
  emails: string[];
=======
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
>>>>>>> origin/Panji2
}
