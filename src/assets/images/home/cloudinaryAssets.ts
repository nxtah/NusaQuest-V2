// Usage (direct map):
// import { pulau } from '@/assets/images/hero/cloudinaryAssets';
// const src = pulau.pulau1;
//
// Usage (dynamic key):
// import { getPulauImage, type PulauImageKey } from '@/assets/images/hero/cloudinaryAssets';
// const key: PulauImageKey = 'pulau1';
// const src = getPulauImage(key);
//
// Usage (awan):
// import { awan, getAwanImage, type AwanImageKey } from '@/assets/images/hero/cloudinaryAssets';
// const a1 = awan.awan1;
// const aSrc = getAwanImage('awan2');
//
// Usage (popup):
// import { popup, getPopupImage, type PopupImageKey } from '@/assets/images/hero/cloudinaryAssets';
// const p1 = popup.nucaIcon;
// const pSrc = getPopupImage('ularTanggaIcon');

// Mapping for hero images from Cloudinary CDN.
// Add new entries (pulau2, pulau3, dst) in one place.
export const pulau = {
  pulau1: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1773464922/NQM4_1_dkiuuv.webp',
  pulau2: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774362912/pulau-2_mqld23.webp',
  pulau3: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774362913/pulau-3_uotkir.webp',
  pulau4: 'https://res.cloudinary.com/dprxjzfxp/image/upload/q_auto/f_auto/v1776075647/pulau-4_kvqdrn.webp',
  mercusuar: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774362913/mercusuar_s7fw5p.webp',
  papan1: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774363085/papan-1_gzqa2m.webp',
} as const;

export const awan = {
  awan1: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774362936/awan-1_yvjrng.webp',
  awan2: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774362935/awan-2_ikvs78.webp',
} as const;

export const popup = {
  nucaIcon: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774506244/nuca-icon_upjnsg.webp',
  ularTanggaIcon: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774506238/ulartangga-icon_pyrz7v.webp',
} as const;

export type PulauImageKey = keyof typeof pulau;
export type AwanImageKey = keyof typeof awan;
export type PopupImageKey = keyof typeof popup;

export function getPulauImage(key: PulauImageKey): string {
  return pulau[key];
}

export function getAwanImage(key: AwanImageKey): string {
  return awan[key];
}

export function getPopupImage(key: PopupImageKey): string {
  return popup[key];
}
