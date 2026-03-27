export type SessionPayload = {
	uid: string;
	role: 'admin' | 'user';
	token: string;
};

export function parseSessionPayload(payload: unknown): SessionPayload {
	if (!payload || typeof payload !== 'object') {
		throw new Error('Invalid session payload: expected object');
	}

	const candidate = payload as Record<string, unknown>;
	const uid = String(candidate.uid ?? '');
	const role = String(candidate.role ?? '');
	const token = String(candidate.token ?? '');

	if (uid.length < 3) {
		throw new Error('Invalid session payload: uid is required');
	}

	if (role !== 'admin' && role !== 'user') {
		throw new Error('Invalid session payload: role must be admin or user');
	}

	if (token.length < 16) {
		throw new Error('Invalid session payload: token is too short');
	}

	return {
		uid,
		role,
		token,
	};
}

export type UserRoleClaimPayload = {
	uid: string;
	role: 'admin' | 'user';
};

export function parseUserRoleClaimPayload(payload: unknown): UserRoleClaimPayload {
	if (!payload || typeof payload !== 'object') {
		throw new Error('Invalid role payload: expected object');
	}

	const candidate = payload as Record<string, unknown>;
	const uid = String(candidate.uid ?? '').trim();
	const role = String(candidate.role ?? '').trim();

	if (uid.length < 3) {
		throw new Error('Invalid role payload: uid is required');
	}

	if (role !== 'admin' && role !== 'user') {
		throw new Error('Invalid role payload: role must be admin or user');
	}

	return {
		uid,
		role,
	};
}
