export const ROUTES = {
	public: {
		root: '/',
		home: '/home',
		login: '/login',
		information: '/information',
		credit: '/credit',
	},
	protected: {
		profile: '/profile',
		lobby: '/lobby',
		room: '/room',
		play: '/play',
	},
	admin: {
		root: '/admin',
		questions: '/admin/questions',
	},
	api: {
		authSession: '/api/auth/session',
		adminQuestions: '/api/admin/questions',
		uploadSignature: '/api/upload/signature',
		health: '/api/health',
	},
} as const;

export const AUTH_COOKIE_NAME = 'nq_session';

export const SESSION_HEADER = 'x-nq-session';
