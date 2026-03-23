import { ref } from 'firebase/database';

import { db } from './client';

export function normalizeFirebasePath(path: string): string {
	return path.replace(/^\/+/, '');
}

export function dbRef(path: string) {
	return ref(db, normalizeFirebasePath(path));
}
