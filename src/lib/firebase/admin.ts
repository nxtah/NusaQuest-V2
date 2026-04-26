import 'server-only';

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';

type AdminEnv = {
	projectId: string;
	clientEmail: string;
	privateKey: string;
	databaseURL: string;
};

function getAdminEnv(): AdminEnv {
	const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
	const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
	const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
	const databaseURL = process.env.FIREBASE_ADMIN_DATABASE_URL;

	const missing: string[] = [];

	if (!projectId) {
		missing.push('FIREBASE_ADMIN_PROJECT_ID');
	}
	if (!clientEmail) {
		missing.push('FIREBASE_ADMIN_CLIENT_EMAIL');
	}
	if (!privateKey) {
		missing.push('FIREBASE_ADMIN_PRIVATE_KEY');
	}
	if (!databaseURL) {
		missing.push('FIREBASE_ADMIN_DATABASE_URL');
	}

	if (missing.length > 0) {
		throw new Error(`Missing Firebase Admin env keys: ${missing.join(', ')}`);
	}

	return {
		projectId: projectId as string,
		clientEmail: clientEmail as string,
		privateKey: privateKey as string,
		databaseURL: databaseURL as string,
	};
}

function getAdminApp() {
	const env = getAdminEnv();

	return getApps().length > 0
		? getApps()[0]
		: initializeApp({
				credential: cert({
					projectId: env.projectId,
					clientEmail: env.clientEmail,
					privateKey: env.privateKey,
				}),
				databaseURL: env.databaseURL,
			});
}

export function getAdminAuth() {
	return getAuth(getAdminApp());
}

export function getAdminDb() {
	return getDatabase(getAdminApp());
}

export async function setUserRoleClaim(uid: string, role: 'admin' | 'user') {
	await getAdminAuth().setCustomUserClaims(uid, { role });
}

export async function clearUserRoleClaim(uid: string) {
	await getAdminAuth().setCustomUserClaims(uid, {});
}

export async function updateUserRoleClaim(uid: string, role: 'admin' | 'user') {
	await setUserRoleClaim(uid, role);
	await getAdminAuth().revokeRefreshTokens(uid);
}

export async function getUserRoleClaim(uid: string): Promise<'admin' | 'user'> {
	const userRecord = await getAdminAuth().getUser(uid);
	const roleClaim = userRecord.customClaims?.role;

	if (roleClaim === 'admin') {
		return 'admin';
	}

	return 'user';
}
