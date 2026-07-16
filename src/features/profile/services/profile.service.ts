import {firebaseDb} from '@/src/lib/firebase/client';
import {ref, onValue, get, set, remove, update} from 'firebase/database';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt?: string;
}

export interface UserAchievement {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  unlockedAt?: string;
}

export interface UserInventory {
  potions?: Record<string, number>;
  items?: Record<string, any>;
}

const USERS_PATH = 'users';
const ACHIEVEMENTS_PATH = 'achievement';
const INVENTORY_PATH = 'inventory';

export function subscribeUserProfile(
  userId: string,
  callback: (profile: UserProfile | null) => void,
): () => void {
  if (!firebaseDb) {
    callback(null);
    return () => { };
  }

  try {
    const userRef = ref(firebaseDb, `${USERS_PATH}/${userId}`);
    return onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({uid: userId, ...snapshot.val()});
      } else {
        callback(null);
      }
    });
  } catch {
    callback(null);
    return () => { };
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>,
): Promise<void> {
  if (!firebaseDb) return;

  try {
    const userRef = ref(firebaseDb, `${USERS_PATH}/${userId}`);
    await update(userRef, updates);
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

export function subscribeUserAchievements(
  userId: string,
  callback: (achievements: Record<string, UserAchievement>) => void,
): () => void {
  if (!firebaseDb) {
    callback({});
    return () => { };
  }

  try {
    const achievementsRef = ref(firebaseDb, `${ACHIEVEMENTS_PATH}/${userId}`);
    return onValue(achievementsRef, (snapshot) => {
      callback(snapshot.val() || {});
    });
  } catch {
    callback({});
    return () => { };
  }
}

export function subscribeUserInventory(
  userId: string,
  callback: (inventory: UserInventory) => void,
): () => void {
  if (!firebaseDb) {
    callback({});
    return () => { };
  }

  try {
    const inventoryRef = ref(firebaseDb, `${INVENTORY_PATH}/${userId}`);
    return onValue(inventoryRef, (snapshot) => {
      callback(snapshot.val() || {});
    });
  } catch {
    callback({});
    return () => { };
  }
}
