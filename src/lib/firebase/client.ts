import {getApps, initializeApp, type FirebaseApp} from 'firebase/app';
import {getAuth, type Auth} from 'firebase/auth';
import {getDatabase, type Database} from 'firebase/database';
import {getStorage, type FirebaseStorage} from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const hasClientConfig = Object.values(firebaseConfig).some(Boolean);

const firebaseApp: FirebaseApp | null = hasClientConfig
  ? getApps()[0] ?? initializeApp(firebaseConfig)
  : null;

const firebaseAuth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;
const firebaseDb: Database | null = firebaseApp ? getDatabase(firebaseApp) : null;
const firebaseStorage: FirebaseStorage | null = firebaseApp
  ? getStorage(firebaseApp)
  : null;

export function assertFirebaseClientConfigured(): void {
  if (!firebaseApp || !firebaseAuth || !firebaseDb || !firebaseStorage) {
    throw new Error(
      'Firebase client is not configured. Please set NEXT_PUBLIC_FIREBASE_* environment variables.',
    );
  }
}

export {firebaseApp, firebaseAuth, firebaseDb, firebaseStorage};
