'use client';

import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/src/features/auth/hooks/useAuth';
import {ROUTES} from '@/src/lib/constants/routes';
import '../../styles/lobby.css';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const {isLoggedIn, isInitialized} = useAuth();

  useEffect(() => {
    if (isInitialized && !isLoggedIn) {
      router.replace(ROUTES.public.login);
    }
  }, [isInitialized, isLoggedIn, router]);

  if (!isInitialized || !isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loader" />
          <p className="mt-4 text-gray-500">Memuat...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
