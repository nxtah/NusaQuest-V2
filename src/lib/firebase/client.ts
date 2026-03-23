import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

import { firebaseClientConfig } from './config';

const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseClientConfig);

const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

export async function getClientAnalytics() {
	if (typeof window === 'undefined') {
		return null;
	}

	const { getAnalytics, isSupported } = await import('firebase/analytics');

	const analyticsSupported = await isSupported();
	if (!analyticsSupported) {
		return null;
	}

	return getAnalytics(app);
}

export { app, auth, db, storage };
