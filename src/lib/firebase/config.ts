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
