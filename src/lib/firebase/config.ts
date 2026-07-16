<<<<<<< HEAD
import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore'
import { getStorage, connectStorageEmulator, FirebaseStorage } from 'firebase/storage'

// Firebase Configuration
const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services
export const auth: Auth = getAuth(app)
export const db: Firestore = getFirestore(app)
export const storage: FirebaseStorage = getStorage(app)

// Emulator setup for development (optional)
if (process.env.NODE_ENV === 'development') {
  // Uncomment to use Firebase Emulator Suite
  // try {
  //   connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
  //   connectFirestoreEmulator(db, 'localhost', 8080)
  //   connectStorageEmulator(storage, 'localhost', 9199)
  // } catch (error) {
  //   // Emulator already running or not available
  // }
}

export default app
=======
const requiredClientEnv = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

function assertFirebaseEnv() {
  const missing = Object.entries(requiredClientEnv)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing Firebase env keys: ${missing.join(', ')}`);
  }
}

assertFirebaseEnv();

export const firebaseClientConfig = {
  apiKey: requiredClientEnv.apiKey as string,
  authDomain: requiredClientEnv.authDomain as string,
  databaseURL: requiredClientEnv.databaseURL as string,
  projectId: requiredClientEnv.projectId as string,
  storageBucket: requiredClientEnv.storageBucket as string,
  messagingSenderId: requiredClientEnv.messagingSenderId as string,
  appId: requiredClientEnv.appId as string,
  measurementId: requiredClientEnv.measurementId as string,
};
>>>>>>> origin/Panji2
