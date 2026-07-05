import 'server-only';

import type { DecodedIdToken } from 'firebase-admin/auth';

import { getAdminAuth } from '../firebase/admin';
import { AUTH_COOKIE_NAME } from '../constants/routes';
import { normalizeRole, type SessionRole } from './session';

type CookieReader = {
  get(name: string): { value: string } | undefined;
};

export type VerifiedServerSession = {
  authenticated: boolean;
  role: SessionRole;
  token: string | null;
  decodedToken: DecodedIdToken | null;
  uid: string | null;
  email: string | null;
};

export async function verifyServerSession(cookies: CookieReader): Promise<VerifiedServerSession> {
  const token = cookies.get(AUTH_COOKIE_NAME)?.value ?? null;

  if (!token) {
    return {
      authenticated: false,
      role: 'guest',
      token: null,
      decodedToken: null,
      uid: null,
      email: null,
    };
  }

  try {
    const decodedToken = await getAdminAuth().verifyIdToken(token, true);

    const roleClaim = typeof decodedToken.role === 'string' ? normalizeRole(decodedToken.role) : 'user';
    const role: SessionRole = roleClaim === 'admin' ? 'admin' : 'user';

    return {
      authenticated: true,
      role,
      token,
      decodedToken,
      uid: decodedToken.uid,
      email: decodedToken.email ?? null,
    };
  } catch {
    return {
      authenticated: false,
      role: 'guest',
      token,
      decodedToken: null,
      uid: null,
      email: null,
    };
  }
}
