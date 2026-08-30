import {
  arrayUnion,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  type DocumentData,
  type FieldValue,
} from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';

import { firebaseFirestore } from '../../../lib/firebase/client';
import type { AppUser, UserBadges, UserInventory } from '../../../types/auth';
import type { AppResult } from '../../../utils/result';

import { getDocument, setDocument, updateDocument, usersCollectionPath } from './base.service';

type UserDocument = AppUser & {
  createdAt: FieldValue | number;
  updatedAt: FieldValue | number;
};

const DEFAULT_INVENTORY: UserInventory = { potion: 1 };
const DEFAULT_BADGES: UserBadges = { gold: 0, silver: 0, bronze: 0 };

function requireFirestore() {
  if (!firebaseFirestore) throw new Error('Firestore not configured');
  return firebaseFirestore;
}

function getUserDocument(uid: string): Promise<AppResult<UserDocument | null>> {
  return getDocument<UserDocument>(usersCollectionPath(), uid);
}

export function getUserProfile(uid: string): Promise<AppResult<AppUser | null>> {
  return getUserDocument(uid);
}

/** Realtime — dipake halaman profil biar potion/badge langsung update
    begitu berubah (abis pake potion, abis menang game), gak perlu refresh. */
export function listenToUserProfile(
  uid: string,
  callback: (profile: AppUser | null) => void,
): () => void {
  return onSnapshot(doc(requireFirestore(), usersCollectionPath(), uid), (snapshot) => {
    callback(snapshot.exists() ? (snapshot.data() as AppUser) : null);
  });
}

// Creates the profile doc on first sign-in; on every later sign-in it just
// refreshes the fields Google itself owns (name/email/photo) while leaving
// app-owned fields (role, firebasePhotoURL, inventory, badges) exactly as
// they already are.
export async function upsertUserFromGoogle(firebaseUser: FirebaseUser): Promise<AppResult<AppUser>> {
  const existing = await getUserDocument(firebaseUser.uid);
  const existingProfile = existing.success ? existing.data : null;

  const profile: UserDocument = {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? existingProfile?.email ?? '',
    displayName: firebaseUser.displayName ?? existingProfile?.displayName ?? 'Nusa Player',
    googlePhotoURL: firebaseUser.photoURL ?? existingProfile?.googlePhotoURL ?? null,
    firebasePhotoURL: existingProfile?.firebasePhotoURL ?? null,
    role: existingProfile?.role ?? 'user',
    // Akun baru mulai dengan 1 potion & badge kosong — akun lama (dibuat
    // sebelum field ini ada) di-backfill default yang sama biar gak undefined.
    inventory: existingProfile?.inventory ?? DEFAULT_INVENTORY,
    badges: existingProfile?.badges ?? DEFAULT_BADGES,
    createdAt: existingProfile?.createdAt ?? serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const result = await setDocument<UserDocument>(usersCollectionPath(), firebaseUser.uid, profile);
  if (!result.success) return result;

  return { success: true, data: profile, error: null };
}

export function updateUserProfile(
  uid: string,
  payload: Partial<AppUser>,
): Promise<AppResult<Partial<AppUser>>> {
  return updateDocument(usersCollectionPath(), uid, {
    ...payload,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Pake 1 potion — dipanggil pas pemain klik "Pakai Potion" di popup
 * pertanyaan (NusaCard/Ular Tangga). Transaction (bukan getDoc+updateDoc
 * biasa) biar gak race kalau somehow ke-klik 2x hampir bersamaan — kalau
 * potion udah 0, no-op & balikin `false`.
 */
export async function consumePotion(uid: string): Promise<boolean> {
  const ref = doc(requireFirestore(), usersCollectionPath(), uid);
  try {
    return await runTransaction(requireFirestore(), async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) return false;
      const data = snap.data() as AppUser;
      const current = data.inventory?.potion ?? 0;
      if (current <= 0) return false;
      tx.update(ref, { 'inventory.potion': current - 1, updatedAt: serverTimestamp() });
      return true;
    });
  } catch (error) {
    console.error('Error using potion:', error);
    return false;
  }
}

export interface GameReward {
  badge: 'gold' | 'silver' | 'bronze';
  potionAwarded: boolean;
}

const RANK_BADGE: Record<1 | 2 | 3, GameReward['badge']> = { 1: 'gold', 2: 'silver', 3: 'bronze' };

/**
 * Kasih reward (badge + potion kalau rank 1) buat 1 pemain begitu game-nya
 * kelar. Idempotent lewat `rewardsClaimedBy` di dokumen gameState-nya
 * sendiri (BUKAN di user doc) — biar aman dipanggil ulang dari reconnect/
 * tab lain tanpa nge-double-grant. `roomID` di sini adalah key yang sama
 * yang dipake buat dokumen `gameStates/{roomID}` di kedua game.
 */
export async function claimGameReward(
  roomID: string,
  uid: string,
  rank: 1 | 2 | 3,
): Promise<GameReward | null> {
  const gameStateRef = doc(requireFirestore(), 'gameStates', roomID);
  const userRef = doc(requireFirestore(), usersCollectionPath(), uid);
  const badge = RANK_BADGE[rank];
  const potionAwarded = rank === 1;

  try {
    return await runTransaction(requireFirestore(), async (tx) => {
      const gsSnap = await tx.get(gameStateRef);
      if (!gsSnap.exists()) return null;
      const gsData = gsSnap.data() as DocumentData;
      const claimedBy: string[] = gsData.rewardsClaimedBy ?? [];
      if (claimedBy.includes(uid)) return null; // udah pernah di-claim

      const userSnap = await tx.get(userRef);
      if (!userSnap.exists()) return null;
      const userData = userSnap.data() as AppUser;
      const badges = userData.badges ?? DEFAULT_BADGES;
      const inventory = userData.inventory ?? DEFAULT_INVENTORY;

      tx.update(userRef, {
        [`badges.${badge}`]: (badges[badge] ?? 0) + 1,
        ...(potionAwarded ? { 'inventory.potion': (inventory.potion ?? 0) + 1 } : {}),
        updatedAt: serverTimestamp(),
      });
      tx.update(gameStateRef, { rewardsClaimedBy: arrayUnion(uid) });

      return { badge, potionAwarded };
    });
  } catch (error) {
    console.error('Error claiming game reward:', error);
    return null;
  }
}
