import {DEFAULT_SESSION_TIMEOUT_MS} from '@/src/lib/constants/auth-security';

type TimeoutHandle = ReturnType<typeof setTimeout>;

export type SessionRole = 'guest' | 'user' | 'admin';

let sessionTimeoutRef: TimeoutHandle | null = null;

export function normalizeRole(value: string | null | undefined): SessionRole {
  if (value === 'admin') return 'admin';
  if (value === 'user') return 'user';
  return 'guest';
}

export function startSessionTimeout(
  onExpire: () => void,
  timeoutMs: number = DEFAULT_SESSION_TIMEOUT_MS,
): void {
  clearSessionTimeout();
  sessionTimeoutRef = setTimeout(onExpire, timeoutMs);
}

export function resetSessionTimeout(
  onExpire: () => void,
  timeoutMs: number = DEFAULT_SESSION_TIMEOUT_MS,
): void {
  startSessionTimeout(onExpire, timeoutMs);
}

export function clearSessionTimeout(): void {
  if (sessionTimeoutRef) {
    clearTimeout(sessionTimeoutRef);
    sessionTimeoutRef = null;
  }
}

export function bindSessionActivityEvents(onActivity: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const events = ['mousemove', 'mousedown', 'keydown', 'touchstart'];
  events.forEach((eventName) => {
    window.addEventListener(eventName, onActivity);
  });

  return () => {
    events.forEach((eventName) => {
      window.removeEventListener(eventName, onActivity);
    });
  };
}
