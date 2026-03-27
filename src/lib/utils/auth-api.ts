import type {DecodedIdToken} from 'firebase-admin/auth';
import {NextResponse, type NextRequest} from 'next/server';
import type {AuthClaims, UserRole} from '@/src/types/auth';
import {getFirebaseAdminAuth} from '@/src/lib/firebase/admin';

export const SESSION_COOKIE_NAME = 'nq_session';

export interface AuthContext {
  token: string;
  claims: AuthClaims;
  role: UserRole;
  isAdmin: boolean;
  decodedToken: DecodedIdToken;
}

export interface WithAuthOptions {
  requireAdmin?: boolean;
}

type AuthHandler = (
  request: NextRequest,
  context: AuthContext,
) => Promise<Response>;

function toClaims(decodedToken: DecodedIdToken): AuthClaims {
  const rawRole = decodedToken.role;
  const role = rawRole === 'admin' ? 'admin' : 'user';

  return {
    uid: decodedToken.uid,
    email: decodedToken.email,
    role,
    admin: decodedToken.admin === true,
    iat: decodedToken.iat,
    exp: decodedToken.exp,
  };
}

export function getRoleFromClaims(claims: AuthClaims): UserRole {
  if (claims.role === 'admin' || claims.admin === true) {
    return 'admin';
  }

  return 'user';
}

export function extractTokenFromRequest(request: NextRequest): string | null {
  const header = request.headers.get('authorization');
  if (header?.startsWith('Bearer ')) {
    return header.slice(7).trim();
  }

  return request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function verifySessionToken(token: string): Promise<AuthContext | null> {
  try {
    const decodedToken = await getFirebaseAdminAuth().verifyIdToken(token, true);
    const claims = toClaims(decodedToken);
    const role = getRoleFromClaims(claims);

    return {
      token,
      claims,
      role,
      isAdmin: role === 'admin',
      decodedToken,
    };
  } catch {
    return null;
  }
}

export function withAuth(handler: AuthHandler, options: WithAuthOptions = {}) {
  return async function authedHandler(request: NextRequest): Promise<Response> {
    const token = extractTokenFromRequest(request);

    if (!token) {
      return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
    }

    const auth = await verifySessionToken(token);

    if (!auth) {
      return NextResponse.json({ok: false, error: 'Invalid or expired token'}, {status: 401});
    }

    if (options.requireAdmin && !auth.isAdmin) {
      return NextResponse.json({ok: false, error: 'Forbidden'}, {status: 403});
    }

    return handler(request, auth);
  };
}
