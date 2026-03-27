import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { ROUTES } from './lib/constants/routes';
import { readSessionFromCookies } from './lib/utils/session';

function isProtectedPath(pathname: string): boolean {
  return (
    pathname.startsWith(ROUTES.protected.profile) ||
    pathname.startsWith(ROUTES.protected.lobby) ||
    pathname.startsWith(ROUTES.protected.room) ||
    pathname.startsWith(ROUTES.protected.play)
  );
}

function isAdminPath(pathname: string): boolean {
  return pathname.startsWith(ROUTES.admin.root);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = readSessionFromCookies(request.cookies);

  if (isProtectedPath(pathname) && !session.authenticated) {
    const loginUrl = new URL(ROUTES.public.login, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Edge proxy only checks auth presence. Admin role is verified server-side via Firebase Admin SDK.
  if (isAdminPath(pathname) && !session.authenticated) {
    const loginUrl = new URL(ROUTES.public.login, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
