import {
	GoogleAuthProvider,
	signInWithPopup,
	signOut,
	type UserCredential,
} from 'firebase/auth';

import { auth } from './client';

const googleProvider = new GoogleAuthProvider();

export function signInWithGoogle(): Promise<UserCredential> {
	return signInWithPopup(auth, googleProvider);
}

export function signOutUser() {
	return signOut(auth);
}
