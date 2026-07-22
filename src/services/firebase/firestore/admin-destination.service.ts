import {
  getDocument,
  setDocument,
  updateDocument,
  addDocument,
  deleteDocument,
  getCollectionDocs,
} from './base.service';
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

const COLLECTION = 'destinations';

export async function getAllDestinations(): Promise<
  AppResult<(KotaProvinsi & { id: string })[]>
> {
  return getCollectionDocs<KotaProvinsi>(COLLECTION);
}

export async function getDestination(
  destinationId: string,
): Promise<AppResult<(KotaProvinsi & { id: string }) | null>> {
  return getDocument<KotaProvinsi>(COLLECTION, destinationId);
}

export async function createDestination(
  destination: Omit<KotaProvinsi, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<AppResult<{id: string}>> {
  return addDocument(COLLECTION, {
    ...destination,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
}

export async function updateDestination(
  destinationId: string,
  updates: Partial<Omit<KotaProvinsi, 'id' | 'createdAt'>>,
): Promise<AppResult<Partial<KotaProvinsi>>> {
  return updateDocument(COLLECTION, destinationId, {
    ...updates,
    updatedAt: Date.now(),
  });
}

export async function deleteDestination(
  destinationId: string,
): Promise<AppResult<null>> {
  return deleteDocument(COLLECTION, destinationId);
}
