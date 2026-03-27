// Mapping for information images from Cloudinary CDN.
// Add new entries in one place.
export const information = {
	imagePopup: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774370185/image-popup_bvtwoq.webp',
	board1: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774370178/board-1_hlxc1z.webp',
	kertas: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774370177/kertas_tdfwu2.webp',
	melati: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774370173/melati_p7wscz.webp',
	rumput: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774370173/rumput_yq8ec5.webp',
	tanaman1: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774370077/tanaman-1_byedew.webp',
	tanaman2: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774370075/tanaman-2_bzxsip.webp',
	tanamankiri:'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774535531/tanaman-kiri_rpyqus.webp',
	tanamankanan:'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774536119/tanaman-kanan_ozzohx.webp',
	teratai: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774370059/teratai_xgpfvi.webp',
} as const;

export type InformationImageKey = keyof typeof information;

export function getInformationImage(key: InformationImageKey): string {
	return information[key];
}
