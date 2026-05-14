import { auth } from '@/lib/firebase/config'
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User,
  onAuthStateChanged,
} from 'firebase/auth'

const googleProvider = new GoogleAuthProvider()

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
  } catch (error) {
    console.error('Google Sign-in Error:', error)
    throw error
  }
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Sign-out Error:', error)
    throw error
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(
  callback: (user: User | null) => void
): () => void {
  return onAuthStateChanged(auth, callback)
}

/**
 * Get current user ID token
 */
export async function getIdToken(): Promise<string | null> {
  if (auth.currentUser) {
    return await auth.currentUser.getIdToken()
  }
  return null
}
