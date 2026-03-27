const DEFAULT_SESSION_TIMEOUT_MS = 8 * 60 * 60 * 1000;

type TimeoutHandle = ReturnType<typeof setTimeout>;

let sessionTimeoutRef: TimeoutHandle | null = null;

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
