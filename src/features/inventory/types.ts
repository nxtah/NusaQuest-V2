/**
 * Item Type
 */
export type ItemType = "potion" | "boost" | "power-up";

/**
 * Item Effect Type
 */
export type ItemEffect = "hint" | "freeze" | "extra-time" | "skip-question" | "double-points";

/**
 * Item Definition
 */
export interface ItemDef {
  itemId: string;
  name: string;
  description: string;
  type: ItemType;
  effect: ItemEffect;
  icon: string;
  rarity: "common" | "uncommon" | "rare" | "epic";
  cooldownSeconds?: number;
  usableInGame: boolean;
  purchasePrice?: number;
}

/**
 * User Inventory Item (with quantity)
 */
export interface InventoryItem {
  itemId: string;
  quantity: number;
  lastUsedAt?: number;
}

/**
 * Inventory State
 */
export interface InventoryState {
  userId: string;
  items: Record<string, InventoryItem>; // itemId -> item
  totalSlots: number;
  usedSlots: number;
}

/**
 * Item Use Action
 */
export interface ItemUseAction {
  userId: string;
  itemId: string;
  usedAt: number;
  gameRoomId?: string;
  effectResult?: Record<string, any>;
}

/**
 * Potion Specific (subset of Item)
 */
export interface Potion extends ItemDef {
  type: "potion";
}

/**
 * Predefined Potions
 */
export const POTIONS: Record<string, Potion> = {
  hint_potion: {
    itemId: "hint_potion",
    name: "Ramuan Petunjuk",
    description: "Dapatkan petunjuk untuk jawaban yang benar",
    type: "potion",
    effect: "hint",
    icon: "💡",
    rarity: "common",
    usableInGame: true,
    purchasePrice: 100,
  },
  freeze_potion: {
    itemId: "freeze_potion",
    name: "Ramuan Pembekuan",
    description: "Bekukan waktu lawan selama 5 detik",
    type: "potion",
    effect: "freeze",
    icon: "❄️",
    rarity: "uncommon",
    cooldownSeconds: 30,
    usableInGame: true,
    purchasePrice: 200,
  },
  time_potion: {
    itemId: "time_potion",
    name: "Ramuan Waktu",
    description: "Tambah 30 detik waktu menjawab",
    type: "potion",
    effect: "extra-time",
    icon: "⏰",
    rarity: "uncommon",
    usableInGame: true,
    purchasePrice: 150,
  },
  skip_potion: {
    itemId: "skip_potion",
    name: "Ramuan Lompatan",
    description: "Lewati soal saat ini",
    type: "potion",
    effect: "skip-question",
    icon: "⏭️",
    rarity: "rare",
    usableInGame: true,
    purchasePrice: 300,
  },
  double_points: {
    itemId: "double_points",
    name: "Ramuan Berlipat",
    description: "Dapatkan 2x poin untuk jawaban berikutnya",
    type: "potion",
    effect: "double-points",
    icon: "✨",
    rarity: "rare",
    usableInGame: true,
    purchasePrice: 250,
  },
};

/**
 * Potion Purchase
 */
export interface PotionPurchase {
  itemId: string;
  quantity: number;
  totalPrice: number;
  purchasedAt: number;
}

/**
 * Shop Item (for display/purchase)
 */
export interface ShopItem {
  item: ItemDef;
  price: number;
  canAfford: boolean;
  userQuantity: number;
}
