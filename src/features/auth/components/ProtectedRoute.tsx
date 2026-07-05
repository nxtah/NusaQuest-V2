'use client';

import {useEffect, type ReactNode} from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/src/features/auth/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const {isInitialized, isLoggedIn, user} = useAuth();

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!isLoggedIn || !user) {
      router.replace('/login');
      return;
    }

    if (requireAdmin && user.role !== 'admin') {
      router.replace('/home');
    }
  }, [isInitialized, isLoggedIn, requireAdmin, router, user]);

  if (!isInitialized) {
    return <main>Checking session...</main>;
  }

  if (!isLoggedIn || !user) {
    return <main>Redirecting to login...</main>;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <main>Access denied.</main>;
  }

  return <>{children}</>;
}
