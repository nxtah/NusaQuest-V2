import { serverTimestamp, type FieldValue } from 'firebase/firestore';

import type { AppResult } from '../../../utils/result';

import {
  addDocument,
  creditsCollectionPath,
  deleteDocument,
  getCollectionDocs,
  listenToCollection,
  updateDocument,
} from './base.service';

export interface CreditMember {
  id?: string;
  name: string;
  role: string;
  bio: string;
  photoURL: string;
  teamVersion: 'V1' | 'V2';
  /** Divisi (Ketua/Developer/Designer/dst) — dikelola manual dari admin,
      lihat credit-sections.service.ts. Kosong = belum dikelompokkan
      (dulu field ini gak ada), ditampilin di grup "Lainnya". */
  sectionId?: string;
  order: number;
  createdAt?: number | FieldValue;
  updatedAt?: number | FieldValue;
}

export type CreditMemberRecord = CreditMember & { id: string };

export function getAllCreditMembers(): Promise<AppResult<CreditMemberRecord[]>> {
  return getCollectionDocs<CreditMember>(creditsCollectionPath());
}

/** Realtime — dipake halaman publik `/credit` biar perubahan dari admin
    langsung kelihatan tanpa refresh. */
export function listenToCreditMembers(
  callback: (members: CreditMemberRecord[]) => void,
): () => void {
  return listenToCollection<CreditMember>(creditsCollectionPath(), callback);
}

export function createCreditMember(
  member: Omit<CreditMember, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<AppResult<{ id: string }>> {
  return addDocument(creditsCollectionPath(), {
    ...member,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function updateCreditMember(
  id: string,
  updates: Partial<Omit<CreditMember, 'id' | 'createdAt'>>,
): Promise<AppResult<Partial<CreditMember>>> {
  return updateDocument(creditsCollectionPath(), id, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export function deleteCreditMember(id: string): Promise<AppResult<null>> {
  return deleteDocument(creditsCollectionPath(), id);
}

/** Grup per versi tim (V1/V2), urut berdasar `order` — cocok sama struktur
    yang sebelumnya di-hardcode di `/credit/page.tsx`. */
export function groupCreditMembersByTeam(
  members: CreditMemberRecord[],
): Record<'V1' | 'V2', CreditMemberRecord[]> {
  const grouped: Record<'V1' | 'V2', CreditMemberRecord[]> = { V1: [], V2: [] };
  for (const member of members) {
    grouped[member.teamVersion]?.push(member);
  }
  grouped.V1.sort((a, b) => a.order - b.order);
  grouped.V2.sort((a, b) => a.order - b.order);
  return grouped;
}
