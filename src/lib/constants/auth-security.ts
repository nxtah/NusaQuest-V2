export const SESSION_COOKIE_NAME = 'nq_session';

export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;
export const DEFAULT_SESSION_TIMEOUT_MS = SESSION_MAX_AGE_SECONDS * 1000;
export const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_SECONDS * 1000;

export const PROTECTED_PATH_PREFIXES = ['/lobby', '/room', '/play'] as const;
export const ADMIN_PATH_PREFIXES = ['/admin'] as const;
export const PROTECTED_API_PREFIXES = ['/api/admin', '/api/upload/signature'] as const;

export const PUBLIC_PATH_PREFIXES = [
  '/login',
  '/home',
  '/information',
  '/destination',
  '/credit',
  '/api/auth/session',
  '/api/auth',
  '/',
] as const;
