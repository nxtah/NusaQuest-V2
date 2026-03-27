import type { SessionInfo } from '../types/auth';

type Listener = (state: SessionInfo) => void;

const authState: SessionInfo = {
	authenticated: false,
	token: null,
	user: null,
};

const listeners = new Set<Listener>();

function emit() {
	listeners.forEach((listener) => listener({ ...authState }));
}

export function getAuthState(): SessionInfo {
	return { ...authState };
}

export function setAuthState(payload: Partial<SessionInfo>) {
	Object.assign(authState, payload);
	emit();
}

export function clearAuthState() {
	authState.authenticated = false;
	authState.token = null;
	authState.user = null;
	emit();
}

export function subscribeAuthState(listener: Listener) {
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
	};
}
