import { AUTH_COOKIE_NAME } from '../constants/routes';

export type SessionRole = 'admin' | 'user' | 'guest';

export type SessionState = {
	authenticated: boolean;
	role: SessionRole;
	token: string | null;
};

type CookieReader = {
	get(name: string): { value: string } | undefined;
};

export function isLikelyValidSessionToken(token: string | null | undefined): boolean {
	if (!token) {
		return false;
	}

	return token.trim().length >= 16;
}

export function normalizeRole(role: string | null | undefined): SessionRole {
	if (role === 'admin') {
		return 'admin';
	}

	if (role === 'user') {
		return 'user';
	}

	return 'guest';
}

export function readSessionFromCookies(cookies: CookieReader): SessionState {
	const token = cookies.get(AUTH_COOKIE_NAME)?.value ?? null;
	const role = isLikelyValidSessionToken(token) ? 'user' : 'guest';

	return {
		authenticated: isLikelyValidSessionToken(token),
		role,
		token,
	};
}
