/**
 * @file session.ts
 * @description Session utilities untuk edge/middleware layer.
 * Digunakan oleh proxy.ts untuk membaca session dari cookies.
 * Catatan: Ini berjalan di Edge Runtime, tidak bisa menggunakan firebase-admin.
 */

import type { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies';
import { AUTH_COOKIE_NAME } from '../constants/routes';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SessionRole = 'admin' | 'user' | 'guest';

export type EdgeSession = {
  authenticated: boolean;
  role:          SessionRole;
  token:         string | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalize role string dari token claim ke SessionRole yang valid.
 * Fallback ke 'user' jika nilai tidak dikenal.
 */
export function normalizeRole(role: string): SessionRole {
  if (role === 'admin') return 'admin';
  if (role === 'user')  return 'user';
  return 'guest';
}

/**
 * Baca session dari cookies di Edge Runtime (middleware/proxy).
 * Hanya membaca token — TIDAK memverifikasi ke Firebase Admin (bukan Edge-compatible).
 * Verifikasi penuh dilakukan di server-session.ts untuk API routes.
 *
 * @param cookies - RequestCookies dari NextRequest
 * @returns EdgeSession berisi status auth dan token mentah
 */
export function readSessionFromCookies(
  cookies: RequestCookies | { get(name: string): { value: string } | undefined }
): EdgeSession {
  const token = cookies.get(AUTH_COOKIE_NAME)?.value ?? null;

  if (!token) {
    return { authenticated: false, role: 'guest', token: null };
  }

  // Di Edge Runtime kita tidak bisa verify token ke Firebase Admin.
  // Kita hanya cek keberadaan token — verifikasi aktual di server-session.ts.
  return { authenticated: true, role: 'user', token };
}
