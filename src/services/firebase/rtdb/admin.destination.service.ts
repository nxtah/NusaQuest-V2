import {getData, setData, updateData, removeData, pushData} from './base.service';
import type {AppResult} from '@/src/utils/result';

export interface KotaProvinsi {
  id?: string;
  nama: string;
  provinsi: string;
  deskripsi?: string;
  latitude?: number;
  longitude?: number;
  type?: string;
  image?: string;
  createdAt?: number;
  updatedAt?: number;
}

/**
 * Get all destination locations (kota & provinsi)
 */
export async function getAllDestinations(): Promise<
  AppResult<Record<string, KotaProvinsi> | null>
> {
  return getData('destination');
}

/**
 * Get a single destination by ID
 */
export async function getDestination(
  destinationId: string,
): Promise<AppResult<KotaProvinsi | null>> {
  return getData(`destination/${destinationId}`);
}

/**
 * Create new destination
 */
export async function createDestination(
  destination: Omit<KotaProvinsi, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<AppResult<{id: string}>> {
  return pushData('destination', {
    ...destination,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
}

/**
 * Update existing destination
 */
export async function updateDestination(
  destinationId: string,
  updates: Partial<Omit<KotaProvinsi, 'id' | 'createdAt'>>,
): Promise<AppResult<Partial<KotaProvinsi>>> {
  return updateData(`destination/${destinationId}`, {
    ...updates,
    updatedAt: Date.now(),
  });
}

/**
 * Delete destination
 */
export async function deleteDestination(
  destinationId: string,
): Promise<AppResult<null>> {
  return removeData(`destination/${destinationId}`);
}

/**
 * Get destinations by type
 */
export async function getDestinationsByType(
  type: string,
): Promise<AppResult<Record<string, KotaProvinsi> | null>> {
  const result = await getData<Record<string, KotaProvinsi>>('destination');

  if (!result.success || !result.data) {
    return result;
  }

  const filtered = Object.entries(result.data)
    .filter(([_, item]) => item.type === type)
    .reduce(
      (acc, [key, val]) => {
        acc[key] = val;
        return acc;
      },
      {} as Record<string, KotaProvinsi>,
    );

  return {
    success: true,
    data: Object.keys(filtered).length > 0 ? filtered : null,
    error: null,
  };
}

/**
 * Get destinations by province
 */
export async function getDestinationsByProvinsi(
  provinsi: string,
): Promise<AppResult<Record<string, KotaProvinsi> | null>> {
  const result = await getData<Record<string, KotaProvinsi>>('destination');

  if (!result.success || !result.data) {
    return result;
  }

  const filtered = Object.entries(result.data)
    .filter(([_, item]) => item.provinsi === provinsi)
    .reduce(
      (acc, [key, val]) => {
        acc[key] = val;
        return acc;
      },
      {} as Record<string, KotaProvinsi>,
    );

  return {
    success: true,
    data: Object.keys(filtered).length > 0 ? filtered : null,
    error: null,
  };
}
