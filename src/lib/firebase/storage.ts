import { ref } from 'firebase/storage';

import { storage } from './client';
import { normalizeFirebasePath } from './db';

export function storageRef(path: string) {
	return ref(storage, normalizeFirebasePath(path));
}
