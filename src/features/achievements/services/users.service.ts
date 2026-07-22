import { firebaseFirestore } from '@/src/lib/firebase/client'
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore'
import { User } from '@/src/types/firestore'

const USERS_COLLECTION = 'users'

function requireFirestore() {
  if (!firebaseFirestore) throw new Error('Firestore not configured');
  return firebaseFirestore;
}

/**
 * Get or create user profile
 */
export async function getOrCreateUser(
  userId: string,
  userData: {
    email: string
    displayName: string
    photoURL?: string
  }
): Promise<User> {
  try {
    const userRef = doc(requireFirestore(), USERS_COLLECTION, userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      return userSnap.data() as User
    }

    // Create new user
    const newUser: User = {
      userId,
      email: userData.email,
      displayName: userData.displayName,
      photoURL: userData.photoURL || '',
      totalPoints: 0,
      totalGamesPlayed: 0,
      totalWins: 0,
      lastLoginAt: Date.now(),
      createdAt: Date.now(),
      inventory: {},
      achievements: {},
    }

    await setDoc(userRef, newUser)
    return newUser
  } catch (error) {
    console.error('Error getting/creating user:', error)
    throw error
  }
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string): Promise<User | null> {
  try {
    const userRef = doc(requireFirestore(), USERS_COLLECTION, userId)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      return null
    }

    return userSnap.data() as User
  } catch (error) {
    console.error('Error getting user profile:', error)
    throw error
  }
}

/**
 * Update user last login
 */
export async function updateLastLogin(userId: string): Promise<void> {
  try {
    const userRef = doc(requireFirestore(), USERS_COLLECTION, userId)
    await updateDoc(userRef, {
      lastLoginAt: Date.now(),
    })
  } catch (error) {
    console.error('Error updating last login:', error)
    throw error
  }
}

/**
 * Add points to user
 */
export async function addUserPoints(
  userId: string,
  points: number
): Promise<void> {
  try {
    const userRef = doc(requireFirestore(), USERS_COLLECTION, userId)
    await updateDoc(userRef, {
      totalPoints: increment(points),
    })
  } catch (error) {
    console.error('Error adding points:', error)
    throw error
  }
}

/**
 * Record game played
 */
export async function recordGamePlayed(
  userId: string,
  isWin: boolean = false
): Promise<void> {
  try {
    const userRef = doc(requireFirestore(), USERS_COLLECTION, userId)
    const updates: Record<string, any> = {
      totalGamesPlayed: increment(1),
    }

    if (isWin) {
      updates.totalWins = increment(1)
    }

    await updateDoc(userRef, updates)
  } catch (error) {
    console.error('Error recording game:', error)
    throw error
  }
}

/**
 * Add item to inventory
 */
export async function addInventoryItem(
  userId: string,
  itemId: string,
  count: number = 1
): Promise<void> {
  try {
    const userRef = doc(requireFirestore(), USERS_COLLECTION, userId)
    const user = await getUserProfile(userId)

    if (!user) {
      throw new Error('User not found')
    }

    const currentCount = user.inventory?.[itemId] || 0
    await updateDoc(userRef, {
      [`inventory.${itemId}`]: currentCount + count,
    })
  } catch (error) {
    console.error('Error adding inventory item:', error)
    throw error
  }
}

/**
 * Unlock achievement
 */
export async function unlockAchievement(
  userId: string,
  achievementId: string
): Promise<void> {
  try {
    const userRef = doc(requireFirestore(), USERS_COLLECTION, userId)
    const user = await getUserProfile(userId)

    if (!user) {
      throw new Error('User not found')
    }

    // Check if already unlocked
    if (user.achievements?.[achievementId]) {
      return
    }

    await updateDoc(userRef, {
      [`achievements.${achievementId}`]: {
        unlockedAt: Date.now(),
        progress: 1,
      },
    })
  } catch (error) {
    console.error('Error unlocking achievement:', error)
    throw error
  }
}

/**
 * Update achievement progress
 */
export async function updateAchievementProgress(
  userId: string,
  achievementId: string,
  progress: number
): Promise<void> {
  try {
    const userRef = doc(requireFirestore(), USERS_COLLECTION, userId)
    await updateDoc(userRef, {
      [`achievements.${achievementId}.progress`]: progress,
    })
  } catch (error) {
    console.error('Error updating achievement progress:', error)
    throw error
  }
}
