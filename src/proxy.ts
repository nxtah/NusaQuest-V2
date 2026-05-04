import type {NextRequest} from 'next/server';
import {NextResponse} from 'next/server';
import {
  ADMIN_PATH_PREFIXES,
  PROTECTED_API_PREFIXES,
  PROTECTED_PATH_PREFIXES,
  PUBLIC_PATH_PREFIXES,
  SESSION_COOKIE_NAME,
} from '@/src/lib/constants/auth-security';

function pathStartsWith(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isProtectedPath(pathname: string): boolean {
  return pathStartsWith(pathname, PROTECTED_PATH_PREFIXES);
}

function isAdminPath(pathname: string): boolean {
  return pathStartsWith(pathname, ADMIN_PATH_PREFIXES);
}

function isProtectedApiPath(pathname: string): boolean {
  return pathStartsWith(pathname, PROTECTED_API_PREFIXES);
}

function isPublicPath(pathname: string): boolean {
  return pathStartsWith(pathname, PUBLIC_PATH_PREFIXES);
}

async function getSessionState(request: NextRequest): Promise<{
  authenticated: boolean;
  role?: 'user' | 'admin';
}> {
  const cookieHeader = request.headers.get('cookie') ?? '';

  try {
    const response = await fetch(`${request.nextUrl.origin}/api/auth/session`, {
      method: 'GET',
      headers: {
        cookie: cookieHeader,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return {authenticated: false};
    }

    const payload = (await response.json()) as {
      authenticated?: boolean;
      user?: {role?: 'user' | 'admin'};
    };

    return {
      authenticated: payload.authenticated === true,
      role: payload.user?.role,
    };
  } catch {
    return {authenticated: false};
  }
}

export async function proxy(request: NextRequest) {
  const {pathname} = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  const needsSession = isProtectedPath(pathname) || isAdminPath(pathname) || isProtectedApiPath(pathname);

  if (!needsSession) {
    if (pathname === '/login' && hasSession) {
      const session = await getSessionState(request);
      if (session.authenticated) {
        return NextResponse.redirect(new URL('/home', request.url));
      }
    }

    return NextResponse.next();
  }

  if (!hasSession) {
    if (isProtectedApiPath(pathname)) {
      return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const session = await getSessionState(request);

  if (!session.authenticated) {
    if (isProtectedApiPath(pathname)) {
      return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  if (isAdminPath(pathname) && session.role !== 'admin') {
    if (isProtectedApiPath(pathname)) {
      return NextResponse.json({ok: false, error: 'Forbidden'}, {status: 403});
    }

    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
