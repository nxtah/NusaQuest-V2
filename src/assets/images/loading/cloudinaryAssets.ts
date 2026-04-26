export const loading = {
	awan3: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774363918/awan-3_xhps96.png',
} as const;

export type LoadingImageKey = keyof typeof loading;

export function getLoadingImage(key: LoadingImageKey): string {
	return loading[key];
}
