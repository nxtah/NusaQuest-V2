import {getData, setData, updateData, removeData, pushData} from './base.service';
import type {AppResult} from '@/src/utils/result';

export interface Informasi {
  id?: string;
  title: string;
  description: string;
  content: string;
  category: string;
  image?: string;
  createdAt?: number;
  updatedAt?: number;
}

/**
 * Get all information
 */
export async function getAllInformasi(): Promise<
  AppResult<Record<string, Informasi> | null>
> {
  return getData('informasi');
}

/**
 * Get a single information by ID
 */
export async function getInformasi(
  informasiId: string,
): Promise<AppResult<Informasi | null>> {
  return getData(`informasi/${informasiId}`);
}

/**
 * Create new information
 */
export async function createInformasi(
  informasi: Omit<Informasi, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<AppResult<{id: string}>> {
  return pushData('informasi', {
    ...informasi,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
}

/**
 * Update existing information
 */
export async function updateInformasi(
  informasiId: string,
  updates: Partial<Omit<Informasi, 'id' | 'createdAt'>>,
): Promise<AppResult<Partial<Informasi>>> {
  return updateData(`informasi/${informasiId}`, {
    ...updates,
    updatedAt: Date.now(),
  });
}

/**
 * Delete information
 */
export async function deleteInformasi(
  informasiId: string,
): Promise<AppResult<null>> {
  return removeData(`informasi/${informasiId}`);
}

/**
 * Get information by category
 */
export async function getInformasiByCategory(
  category: string,
): Promise<AppResult<Record<string, Informasi> | null>> {
  const result = await getData<Record<string, Informasi>>('informasi');

  if (!result.success || !result.data) {
    return result;
  }

  const filtered = Object.entries(result.data)
    .filter(([_, item]) => item.category === category)
    .reduce(
      (acc, [key, val]) => {
        acc[key] = val;
        return acc;
      },
      {} as Record<string, Informasi>,
    );

  return {
    success: true,
    error: null,
    data: Object.keys(filtered).length > 0 ? filtered : null,
  };
}
