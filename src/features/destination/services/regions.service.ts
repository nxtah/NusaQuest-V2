import { firebaseFirestore } from '@/src/lib/firebase/client'
import { collection, doc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore'
import { Region } from '@/src/types/firestore'

const REGIONS_COLLECTION = 'regions'

function requireFirestore() {
  if (!firebaseFirestore) throw new Error('Firestore not configured');
  return firebaseFirestore;
}

/**
 * Fetch active regions, optionally scoped to one map
 */
export async function getRegions(mapId?: string): Promise<Region[]> {
  try {
    const constraints = [where('isActive', '==', true)]
    if (mapId) constraints.push(where('mapId', '==', mapId))

    const q = query(
      collection(requireFirestore(), REGIONS_COLLECTION),
      ...constraints,
      orderBy('name', 'asc')
    )
    const snapshot = await getDocs(q)
    const regions: Region[] = snapshot.docs.map((doc) => ({
      ...doc.data(),
    } as Region))
    return regions
  } catch (error) {
    console.error('Error fetching regions:', error)
    throw error
  }
}

/**
 * Fetch single region by ID
 */
export async function getRegionById(regionId: string): Promise<Region | null> {
  try {
    const snapshot = await getDoc(doc(requireFirestore(), REGIONS_COLLECTION, regionId))
    return snapshot.exists() ? ({...snapshot.data()} as Region) : null
  } catch (error) {
    console.error('Error fetching region:', error)
    throw error
  }
}

/**
 * Fetch region by code (URL-friendly identifier)
 */
export async function getRegionByCode(code: string): Promise<Region | null> {
  try {
    const regions = await getRegions()
    return regions.find((region) => region.code === code) || null
  } catch (error) {
    console.error('Error fetching region by code:', error)
    throw error
  }
}
