import { signInWithGoogle, signOutUser } from '../../../lib/firebase/auth';
import { saveUserProfile } from '../../../services/firebase/rtdb/users.service';
import type { UserProfile } from '../../../types/firebase.types';
import { toFailure, toSuccess, type AppResult } from '../../../utils/result';

export async function loginWithGoogle(): Promise<AppResult<UserProfile>> {
	try {
		const credential = await signInWithGoogle();
		const firebaseUser = credential.user;

		const profile: UserProfile = {
			uid: firebaseUser.uid,
			displayName: firebaseUser.displayName ?? 'Unknown User',
			email: firebaseUser.email ?? '',
			photoURL: firebaseUser.photoURL ?? undefined,
			updatedAt: Date.now(),
		};

		await saveUserProfile(profile);

		return toSuccess(profile);
	} catch (error) {
		return toFailure<UserProfile>(error);
	}
}

export async function logoutUser(): Promise<AppResult<null>> {
	try {
		await signOutUser();
		return toSuccess(null);
	} catch (error) {
		return toFailure<null>(error);
	}
}
