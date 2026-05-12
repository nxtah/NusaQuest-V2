/**
 * @file board-rules.ts
 * @description Definisi tangga dan ular serta logic perpindahan pion.
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

export const SNAKES: Record<number, number> = {
  23: 2,
  30: 9,
  56: 39,
  66: 44,
  68: 14,
  91: 49,
  94: 67,
  98: 79,
};

/**
 * Mendapatkan posisi tujuan jika berada di pangkal tangga.
 */
export function getLadderTarget(pos: number): number | null {
  return LADDERS[pos] || null;
}

/**
 * Mendapatkan posisi tujuan jika berada di kepala ular.
 */
export function getSnakeTarget(pos: number): number | null {
  return SNAKES[pos] || null;
}

/**
 * Mengecek apakah sebuah kotak adalah pangkal tangga.
 */
export function isLadderStart(pos: number): boolean {
  return !!LADDERS[pos];
}

/**
 * Mengecek apakah sebuah kotak adalah kepala ular.
 */
export function isSnakeHead(pos: number): boolean {
  return !!SNAKES[pos];
}
