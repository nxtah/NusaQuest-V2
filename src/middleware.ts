import type {NextRequest} from 'next/server';
import {NextResponse} from 'next/server';

const SESSION_COOKIE_NAME = 'nq_session';

const PROTECTED_PATH_PREFIXES = ['/profile', '/lobby', '/room', '/play'];
const ADMIN_PATH_PREFIXES = ['/admin'];
const PROTECTED_API_PREFIXES = ['/api/admin', '/api/upload/signature'];

const PUBLIC_PATH_PREFIXES = [
  '/login',
  '/home',
  '/information',
  '/destination',
  '/credit',
  '/api/auth/session',
  '/api/auth',
  '/',
];

function pathStartsWith(pathname: string, prefixes: string[]): boolean {
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

export function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if ((isProtectedPath(pathname) || isAdminPath(pathname)) && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isProtectedApiPath(pathname) && !hasSession) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }

  if (pathname === '/login' && hasSession) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  if (!isPublicPath(pathname) && !isProtectedPath(pathname) && !isAdminPath(pathname) && !isProtectedApiPath(pathname)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
