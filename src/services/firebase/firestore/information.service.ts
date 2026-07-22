import { serverTimestamp, type FieldValue } from 'firebase/firestore';

import type { AppResult } from '../../../utils/result';

import {
  addDocument,
  deleteDocument,
  getCollectionDocs,
  getDocument,
  informationItemsCollectionPath,
  updateDocument,
} from './base.service';

export const INFORMATION_TABS = [
  'Daerah',
  'Kuliner',
  'Bahari',
  'Pariwisata Darat',
  'Permainan Daerah',
] as const;

export type InformationTab = (typeof INFORMATION_TABS)[number];

export interface InformationItem {
  id?: string;
  tab: InformationTab;
  sectionTitle: string;
  title: string;
  description: string;
  imageUrl: string;
  order: number;
  createdAt?: number | FieldValue;
  updatedAt?: number | FieldValue;
}

// Firestore always attaches a real id once a document is read back — this
// alias documents that guarantee for read paths, instead of every caller
// having to re-narrow the create-shape's optional `id`.
export type InformationItemRecord = InformationItem & { id: string };

export function getAllInformationItems(): Promise<AppResult<InformationItemRecord[]>> {
  return getCollectionDocs<InformationItem>(informationItemsCollectionPath());
}

export function getInformationItem(id: string): Promise<AppResult<InformationItemRecord | null>> {
  return getDocument<InformationItem>(informationItemsCollectionPath(), id);
}

export async function getInformationItemsByTab(
  tab: InformationTab,
): Promise<AppResult<InformationItemRecord[]>> {
  const result = await getAllInformationItems();
  if (!result.success) return result;

  return {
    success: true,
    data: result.data.filter((item) => item.tab === tab),
    error: null,
  };
}

export function createInformationItem(
  item: Omit<InformationItem, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<AppResult<{ id: string }>> {
  return addDocument(informationItemsCollectionPath(), {
    ...item,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function updateInformationItem(
  id: string,
  updates: Partial<Omit<InformationItem, 'id' | 'createdAt'>>,
): Promise<AppResult<Partial<InformationItem>>> {
  return updateDocument(informationItemsCollectionPath(), id, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export function deleteInformationItem(id: string): Promise<AppResult<null>> {
  return deleteDocument(informationItemsCollectionPath(), id);
}

export interface InformationSection {
  sectionTitle: string;
  items: InformationItemRecord[];
}

// Groups a flat item list into the (sectionTitle -> items[]) rows the public
// page renders. Sections are ordered by the lowest `order` value among their
// items (i.e. whichever section's first item was created earliest comes
// first); items within a section are sorted by their own `order`.
export function groupInformationItemsBySection(items: InformationItemRecord[]): InformationSection[] {
  const bySection = new Map<string, InformationItemRecord[]>();

  for (const item of items) {
    const existing = bySection.get(item.sectionTitle);
    if (existing) {
      existing.push(item);
    } else {
      bySection.set(item.sectionTitle, [item]);
    }
  }

  const sections: InformationSection[] = Array.from(bySection.entries()).map(
    ([sectionTitle, sectionItems]) => ({
      sectionTitle,
      items: [...sectionItems].sort((a, b) => a.order - b.order),
    }),
  );

  sections.sort((a, b) => {
    const aMinOrder = Math.min(...a.items.map((item) => item.order));
    const bMinOrder = Math.min(...b.items.map((item) => item.order));
    return aMinOrder - bMinOrder;
  });

  return sections;
}
