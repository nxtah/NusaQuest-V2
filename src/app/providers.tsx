'use client';

import {AuthProvider} from '@/src/features/auth/context/AuthContext';

export default function Providers({children}: {children: React.ReactNode}) {
  return <AuthProvider>{children}</AuthProvider>;
}
