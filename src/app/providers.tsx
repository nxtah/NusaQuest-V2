'use client';

import {useEffect} from 'react';
import {onFirebaseAuthStateChanged} from '@/src/lib/firebase/auth';
import {upsertUserFromGoogle} from '@/src/services/firebase/firestore/users.service';
import {useAuthStore} from '@/src/store/useAuthStore';

export default function Providers({children}: {children: React.ReactNode}) {
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setInitialized = useAuthStore((state) => state.setInitialized);

  useEffect(() => {
    // This provider wraps the whole app, including public pages that never
    // touch auth — if Firebase client config is ever incomplete, fail into
    // "logged out" instead of crashing every page under it.
    try {
      const unsubscribe = onFirebaseAuthStateChanged(async (firebaseUser) => {
        if (!firebaseUser) {
          setUser(null);
          setInitialized(true);
          return;
        }

        setLoading(true);
        const result = await upsertUserFromGoogle(firebaseUser);
        if (result.success) {
          setUser(result.data);
        }
        setLoading(false);
        setInitialized(true);
      });

      return () => unsubscribe();
    } catch {
      setInitialized(true);
      return undefined;
    }
  }, [setUser, setLoading, setInitialized]);

  return <>{children}</>;
}
