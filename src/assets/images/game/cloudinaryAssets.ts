export const game = {
  vector: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1782988574/Vector_pmesry.svg',
  kertas: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1777425296/kertas_dkkqen.webp',
  popupSetting: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774507283/popup-setting_fggbsk.webp',
} as const;

export type GameImageKey = keyof typeof game;

export function getGameImage(key: GameImageKey): string {
  return game[key];
}
