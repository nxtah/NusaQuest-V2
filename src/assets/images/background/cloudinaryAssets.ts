export const background = {
	kayu: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774506109/kayu_filvkl.webp',
	bgNusa: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774506052/bg-nusa_vbymz7.webp',
	land: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774363692/land_s8u01e.webp',
	langit: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774363032/langit_uh640b.webp',
	laut: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774363032/laut_qbcbsx.webp',
} as const;

export type BackgroundImageKey = keyof typeof background;

export function getBackgroundImage(key: BackgroundImageKey): string {
	return background[key];
}
