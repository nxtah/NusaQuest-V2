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
