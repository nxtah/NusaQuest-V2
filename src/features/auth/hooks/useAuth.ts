import {useContext} from 'react';
import {AuthContext} from '@/src/features/auth/context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
}

export default useAuth;
