export const nuca = {
    laut: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774363032/laut_qbcbsx.webp',
    teratai: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774370059/teratai_xgpfvi.webp',
    tanaman: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774370077/tanaman-1_byedew.webp',
    awan: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774363918/awan-3_xhps96.png',
    kayu: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774506109/kayu_filvkl.webp',
    nuca: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1782913002/Frame_76_i8wyjf.webp',
    arrowNuca: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1782988574/Vector_pmesry.svg',
} as const;

export type NucaImageKey = keyof typeof nuca;

export function getNucaImage(key: NucaImageKey): string {
	return nuca[key];
}
