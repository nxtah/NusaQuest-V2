import { serverTimestamp, type FieldValue } from 'firebase/firestore';

import type { AppResult } from '../../../utils/result';
import { toFailure } from '../../../utils/result';

import {
  addDocument,
  creditSectionsCollectionPath,
  deleteDocument,
  getCollectionDocs,
  listenToCollection,
  updateDocument,
} from './base.service';
import { getAllCreditMembers } from './credits.service';

/** Divisi (Ketua/Developer/Designer/dst) — pengelompokan manual dari admin
    di dalam satu `teamVersion`, terpisah dari `credits.service.ts` biar
    gampang dikelola independen (nambah/ganti nama/hapus divisi gak perlu
    nyentuh data anggota). */
export interface CreditSection {
  id?: string;
  name: string;
  teamVersion: 'V1' | 'V2';
  order: number;
  createdAt?: number | FieldValue;
  updatedAt?: number | FieldValue;
}

export type CreditSectionRecord = CreditSection & { id: string };

export function getAllCreditSections(): Promise<AppResult<CreditSectionRecord[]>> {
  return getCollectionDocs<CreditSection>(creditSectionsCollectionPath());
}

/** Realtime — dipake admin (Kelola Divisi) & halaman publik `/credit`. */
export function listenToCreditSections(
  callback: (sections: CreditSectionRecord[]) => void,
): () => void {
  return listenToCollection<CreditSection>(creditSectionsCollectionPath(), callback);
}

export function createCreditSection(
  section: Omit<CreditSection, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<AppResult<{ id: string }>> {
  return addDocument(creditSectionsCollectionPath(), {
    ...section,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function updateCreditSection(
  id: string,
  updates: Partial<Omit<CreditSection, 'id' | 'createdAt'>>,
): Promise<AppResult<Partial<CreditSection>>> {
  return updateDocument(creditSectionsCollectionPath(), id, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/** Cegah hapus divisi yang masih ada anggotanya — daripada anggota jadi
    "yatim" (sectionId nunjuk ke divisi yang udah gak ada). */
export async function deleteCreditSection(id: string): Promise<AppResult<null>> {
  const membersResult = await getAllCreditMembers();
  if (!membersResult.success) {
    return toFailure<null>(new Error(membersResult.error));
  }
  const stillUsed = membersResult.data.some((member) => member.sectionId === id);
  if (stillUsed) {
    return toFailure<null>(new Error('Masih ada anggota di divisi ini — pindahkan dulu sebelum menghapus.'));
  }
  return deleteDocument(creditSectionsCollectionPath(), id);
}

/** Grup per versi tim (V1/V2), urut berdasar `order` — dipake bareng
    `groupCreditMembersByTeam` di public page & admin. */
export function groupCreditSectionsByTeam(
  sections: CreditSectionRecord[],
): Record<'V1' | 'V2', CreditSectionRecord[]> {
  const grouped: Record<'V1' | 'V2', CreditSectionRecord[]> = { V1: [], V2: [] };
  for (const section of sections) {
    grouped[section.teamVersion]?.push(section);
  }
  grouped.V1.sort((a, b) => a.order - b.order);
  grouped.V2.sort((a, b) => a.order - b.order);
  return grouped;
}
