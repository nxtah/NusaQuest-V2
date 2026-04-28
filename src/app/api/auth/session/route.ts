import {NextResponse, type NextRequest} from 'next/server';
import {sessionTokenSchema} from '@/src/lib/schemas/auth.schema';
import {getFirebaseAdminAuth} from '@/src/lib/firebase/admin';
import {
  SESSION_MAX_AGE_MS,
  SESSION_MAX_AGE_SECONDS,
} from '@/src/lib/constants/auth-security';
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from '@/src/lib/utils/auth-api';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ok: true, authenticated: false});
  }

  const auth = await verifySessionToken(token);

  if (!auth) {
    const response = NextResponse.json({ok: true, authenticated: false});
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  return NextResponse.json({
    ok: true,
    authenticated: true,
    user: {
      uid: auth.claims.uid,
      email: auth.claims.email,
      role: auth.role,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const adminAuth = getFirebaseAdminAuth();
    const payload = sessionTokenSchema.parse(await request.json());
    const decoded = await adminAuth.verifyIdToken(payload.idToken, true);
    const sessionCookie = await adminAuth.createSessionCookie(payload.idToken, {
      expiresIn: SESSION_MAX_AGE_MS,
    });

    const response = NextResponse.json({
      ok: true,
      user: {
        uid: decoded.uid,
        email: decoded.email,
        role: decoded.role === 'admin' || decoded.admin === true ? 'admin' : 'user',
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionCookie,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_MAX_AGE_SECONDS,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ok: false, error: 'Invalid token payload'}, {status: 400});
  }
}

export async function DELETE() {
  const response = NextResponse.json({ok: true});
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
