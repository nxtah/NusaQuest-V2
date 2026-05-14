import { db } from '@/lib/firebase/config'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { Region } from '@/src/types/firestore'

const REGIONS_COLLECTION = 'regions'

/**
 * Fetch all active regions
 */
export async function getRegions(): Promise<Region[]> {
  try {
    const q = query(
      collection(db, REGIONS_COLLECTION),
      where('isActive', '==', true),
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
    const regions = await getRegions()
    return regions.find((region) => region.regionId === regionId) || null
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
