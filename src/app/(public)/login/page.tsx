'use client';

import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/src/features/auth/hooks/useAuth';

export default function Page() {
  const router = useRouter();
  const {isInitialized, isLoggedIn, signInWithGoogle} = useAuth();

  useEffect(() => {
    if (isInitialized && isLoggedIn) {
      router.replace('/home');
    }
  }, [isInitialized, isLoggedIn, router]);

  return (
    <main>
      <h1>Login</h1>
      <p>Masuk menggunakan akun Google untuk melanjutkan permainan.</p>
      <button onClick={signInWithGoogle} type="button">
        Sign In With Google
      </button>
    </main>
  );
}
