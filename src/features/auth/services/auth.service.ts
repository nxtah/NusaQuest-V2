import { firebaseAuth as auth } from '@/src/lib/firebase/client'
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User,
  onAuthStateChanged,
} from 'firebase/auth'

const googleProvider = new GoogleAuthProvider()

function getAuth() {
  if (!auth) throw new Error('Firebase Auth is not configured')
  return auth
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(getAuth(), googleProvider)
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
    await signOut(getAuth())
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
  return onAuthStateChanged(getAuth(), callback)
}

/**
 * Get current user ID token
 */
export async function getIdToken(): Promise<string | null> {
  const currentUser = getAuth().currentUser
  if (currentUser) {
    return await currentUser.getIdToken()
  }
  return null
}
