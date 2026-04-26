/**
 * @file routes.ts
 * @description Application routing constants dan session configuration.
 * Digunakan oleh middleware, proxy, dan server-session utils.
 */

// ─── Route Map (untuk proxy.ts dan server-side) ───────────────────────────────

export const ROUTES = {
  public: {
    home:        '/home',
    login:       '/login',
    information: '/information',
  },
  protected: {
    profile: '/profile',
    lobby:   '/lobby',
    room:    '/room',
    play:    '/play',
  },
  admin: {
    root: '/admin',
  },
} as const;

// ─── Session Cookie ───────────────────────────────────────────────────────────

/** Nama cookie untuk session token Firebase (digunakan oleh server-session dan middleware) */
export const AUTH_COOKIE_NAME   = 'nq_session';

/** Alias lama — digunakan di beberapa file auth service lama */
export const SESSION_COOKIE_NAME = AUTH_COOKIE_NAME;

// ─── Session Expiry ───────────────────────────────────────────────────────────

/** Durasi sesi dalam detik: 7 hari */
export const SESSION_EXPIRY_SECONDS = 60 * 60 * 24 * 7;

/** Durasi sesi dalam ms (untuk cookie maxAge) */
export const SESSION_EXPIRY_MS = SESSION_EXPIRY_SECONDS * 1000;
