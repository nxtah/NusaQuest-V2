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
import type { AppUser, UserAchievements, UserBadges, UserInventory, UserStats } from '../../../types/auth';
import type { AppResult } from '../../../utils/result';

import { getDocument, setDocument, updateDocument, usersCollectionPath } from './base.service';

type UserDocument = AppUser & {
  createdAt: FieldValue | number;
  updatedAt: FieldValue | number;
};

const DEFAULT_INVENTORY: UserInventory = { potion: 1 };
const DEFAULT_BADGES: UserBadges = { gold: 0, silver: 0, bronze: 0 };
const DEFAULT_STATS: UserStats = { winStreak: 0 };
const DEFAULT_ACHIEVEMENTS: UserAchievements = { speedRun: false, streak: false };
const SPEED_RUN_MS = 10 * 60 * 1000;
const WIN_STREAK_TARGET = 3;

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
    stats: existingProfile?.stats ?? DEFAULT_STATS,
    achievements: existingProfile?.achievements ?? DEFAULT_ACHIEVEMENTS,
    // Akun BENERAN baru (belum ada dokumen sama sekali) -> false, nampilin
    // popup perkenalan sekali. Akun lama yang belum punya field ini
    // di-backfill true, BUKAN false — biar gak tiba-tiba nongol ke semua
    // orang yang udah lama main.
    hasSeenIntro: existingProfile ? (existingProfile.hasSeenIntro ?? true) : false,
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

/**
 * Update win-streak + achievement stats begitu 1 pemain nyelesain game
 * (menang ATAU kalah) — TERPISAH dari `claimGameReward` (yang cuma jalan
 * buat rank 1-3) karena kalah pun perlu nge-reset streak. Idempotent lewat
 * `statsRecordedBy` di dokumen gameState (guard sendiri, beda dari
 * `rewardsClaimedBy`) biar reconnect/reload gak dobel-proses.
 */
export async function recordMatchOutcome(
  roomID: string,
  uid: string,
  won: boolean,
  durationMs?: number,
): Promise<void> {
  const gameStateRef = doc(requireFirestore(), 'gameStates', roomID);
  const userRef = doc(requireFirestore(), usersCollectionPath(), uid);

  try {
    await runTransaction(requireFirestore(), async (tx) => {
      const gsSnap = await tx.get(gameStateRef);
      if (!gsSnap.exists()) return;
      const gsData = gsSnap.data() as DocumentData;
      const recordedBy: string[] = gsData.statsRecordedBy ?? [];
      if (recordedBy.includes(uid)) return;

      const userSnap = await tx.get(userRef);
      if (!userSnap.exists()) return;
      const userData = userSnap.data() as AppUser;
      const stats = userData.stats ?? DEFAULT_STATS;
      const achievements = userData.achievements ?? DEFAULT_ACHIEVEMENTS;

      const newStreak = won ? (stats.winStreak ?? 0) + 1 : 0;
      const speedRun = achievements.speedRun
        || (won && durationMs !== undefined && durationMs < SPEED_RUN_MS);
      const streak = achievements.streak || newStreak >= WIN_STREAK_TARGET;

      tx.update(userRef, {
        'stats.winStreak': newStreak,
        'achievements.speedRun': speedRun,
        'achievements.streak': streak,
        updatedAt: serverTimestamp(),
      });
      tx.update(gameStateRef, { statsRecordedBy: arrayUnion(uid) });
    });
  } catch (error) {
    console.error('Error recording match outcome:', error);
  }
}
