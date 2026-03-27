export type Role = 'admin' | 'user' | 'guest';

export type SessionUser = {
	uid: string;
	displayName: string;
	email: string;
	role: Role;
};

export type SessionInfo = {
	authenticated: boolean;
	token: string | null;
	user: SessionUser | null;
};
