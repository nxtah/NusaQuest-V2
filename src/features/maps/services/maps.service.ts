import { firebaseFirestore } from '@/src/lib/firebase/client'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { GameMap } from '@/src/types/firestore'

const MAPS_COLLECTION = 'maps'

function requireFirestore() {
  if (!firebaseFirestore) throw new Error('Firestore not configured');
  return firebaseFirestore;
}

/**
 * Fetch all active maps
 */
export async function getMaps(): Promise<GameMap[]> {
  try {
    const q = query(collection(requireFirestore(), MAPS_COLLECTION), orderBy('order', 'asc'))
    const snapshot = await getDocs(q)
    const maps: GameMap[] = snapshot.docs.map((doc) => ({
      ...doc.data(),
    } as GameMap))
    return maps.filter((map) => map.isActive)
  } catch (error) {
    console.error('Error fetching maps:', error)
    throw error
  }
}

/**
 * Fetch single map by ID
 */
export async function getMapById(mapId: string): Promise<GameMap | null> {
  try {
    const maps = await getMaps()
    return maps.find((map) => map.mapId === mapId) || null
  } catch (error) {
    console.error('Error fetching map:', error)
    throw error
  }
}
