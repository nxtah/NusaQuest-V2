import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { verifyServerSession } from '../../../../lib/utils/server-session';

export async function GET() {
  const session = await verifyServerSession(await cookies());

  return NextResponse.json({
    ok: true,
    route: 'auth/session',
    authenticated: session.authenticated,
    role: session.role,
    uid: session.uid,
    email: session.email,
  });
}
