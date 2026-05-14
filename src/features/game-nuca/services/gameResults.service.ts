import { db } from '@/lib/firebase/config'
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { GameResult } from '@/src/types/firestore'

const GAME_RESULTS_COLLECTION = 'gameResults'

/**
 * Save game result
 */
export async function saveGameResult(
  result: Omit<GameResult, 'resultId'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, GAME_RESULTS_COLLECTION), result)
    return docRef.id
  } catch (error) {
    console.error('Error saving game result:', error)
    throw error
  }
}

/**
 * Get user's game history
 */
export async function getUserGameHistory(
  userId: string,
  limit_count: number = 20
): Promise<GameResult[]> {
  try {
    const q = query(
      collection(db, GAME_RESULTS_COLLECTION),
      where('finalRanking', 'array-contains-any', [{ userId }]),
      orderBy('createdAt', 'desc'),
      limit(limit_count)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((docSnap) => ({
      resultId: docSnap.id,
      ...docSnap.data(),
    } as GameResult))
  } catch (error) {
    console.error('Error getting user game history:', error)
    throw error
  }
}

/**
 * Get leaderboard by map & region
 */
export async function getLeaderboard(
  mapId: string,
  regionId: string,
  limit_count: number = 10
): Promise<Array<{ userId: string; totalWins: number; avgScore: number }>> {
  try {
    const q = query(
      collection(db, GAME_RESULTS_COLLECTION),
      where('mapId', '==', mapId),
      where('regionId', '==', regionId),
      orderBy('createdAt', 'desc'),
      limit(100) // Get last 100 games for calculation
    )
    const snapshot = await getDocs(q)
    const results = snapshot.docs.map((docSnap) => docSnap.data() as GameResult)

    // Calculate user stats
    const userStats = new Map<
      string,
      { totalWins: number; totalScore: number; gameCount: number }
    >()

    results.forEach((result) => {
      result.finalRanking.forEach((ranking) => {
        const existing = userStats.get(ranking.userId) || {
          totalWins: 0,
          totalScore: 0,
          gameCount: 0,
        }
        existing.gameCount++
        existing.totalScore += ranking.score
        if (ranking.position === 1) {
          existing.totalWins++
        }
        userStats.set(ranking.userId, existing)
      })
    })

    // Convert to array and sort
    const leaderboard = Array.from(userStats.entries())
      .map(([userId, stats]) => ({
        userId,
        totalWins: stats.totalWins,
        avgScore: Math.round(stats.totalScore / stats.gameCount),
      }))
      .sort((a, b) => b.totalWins - a.totalWins || b.avgScore - a.avgScore)
      .slice(0, limit_count)

    return leaderboard
  } catch (error) {
    console.error('Error getting leaderboard:', error)
    throw error
  }
}
