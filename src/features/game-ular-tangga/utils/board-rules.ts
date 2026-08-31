/**
 * @file board-rules.ts
 * @description Definisi tangga & ular serta logic perpindahan pion.
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

// Kepala ular (key) → ekor ular (value). Pion langsung turun, tanpa soal.
export const SNAKES: Record<number, number> = {
  23: 2,
  30: 9,
  58: 39,
  68: 14,
  66: 44,
  91: 49,
  94: 67,
  98: 79,
};

export function getLadderTarget(pos: number): number | null {
  return LADDERS[pos] ?? null;
}

export function isLadderStart(pos: number): boolean {
  return pos in LADDERS;
}

export function getSnakeTail(pos: number): number | null {
  return SNAKES[pos] ?? null;
}

export function isSnakeHead(pos: number): boolean {
  return pos in SNAKES;
}
