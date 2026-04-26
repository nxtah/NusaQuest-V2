// Mapping for badge images from Cloudinary CDN.
export const badge = {
  bronze1: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774703090/BRONZE_1_g6meub.webp',
  bronze2: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774703090/BRONZE_2_meeb4d.webp',
  bronze3: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774703090/BRONZE_3_plme1m.webp',
  silver1: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774703089/SILVER_1_vg1au0.webp',
  silver2: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774703089/SILVER_2_qmiqra.webp',
  silver3: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774703089/SILVER_3_ogbvrt.webp',
  gold1: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774703089/GOLD_1_xuaiim.webp',
  gold2: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774703090/GOLD_2_l8bgju.webp',
  gold3: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774703089/GOLD_3_dbfd7s.webp',
} as const;

export const achievements = {
  achievements1: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774703090/BRONZE_3_plme1m.webp',

} as const;

export const attribut = {
  potion1: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774704483/potion1_j2wtc8.webp',
} as const;

export type BadgeImageKey = keyof typeof badge;
export type AchievementsImageKey = keyof typeof achievements;
export type AttributImageKey = keyof typeof attribut;




export function getBadgeImage(key: BadgeImageKey): string {
  return badge[key];
}

export function getAchievementsImage(key: AchievementsImageKey): string {
  return achievements[key];
}

export function getAttributImage(key: AttributImageKey): string {
  return attribut[key];
}
