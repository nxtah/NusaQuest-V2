/**
 * @file board-rules.ts
 * @description Definisi tangga serta logic perpindahan pion.
 * Data lengkap tangga (Start-End) sesuai permintaan user.
 */

export const LADDERS: Record<number, number> = {
  1: 60,
  6: 25,
  17: 67,
  28: 49,
  50: 70,
  65: 76,
  62: 81,
  73: 89,
  86: 95,
};

/**
 * Mendapatkan posisi tujuan jika berada di pangkal tangga.
 */
export function getLadderTarget(pos: number): number | null {
  return LADDERS[pos] || null;
}

/**
 * Mengecek apakah sebuah kotak adalah pangkal tangga.
 */
export function isLadderStart(pos: number): boolean {
  return !!LADDERS[pos];
}
