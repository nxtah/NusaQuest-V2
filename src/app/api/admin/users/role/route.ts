import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { getUserRoleClaim, updateUserRoleClaim } from '../../../../../lib/firebase/admin';
import { parseUserRoleClaimPayload } from '../../../../../lib/schemas/auth.schema';
import { verifyServerSession } from '../../../../../lib/utils/server-session';

async function ensureAdminAccess() {
  const session = await verifyServerSession(await cookies());

  if (!session.authenticated || session.role !== 'admin') {
    throw new Error('Forbidden');
  }

  return session;
}

function readUidFromQuery(request: Request): string {
  const url = new URL(request.url);
  const uid = (url.searchParams.get('uid') ?? '').trim();

  if (uid.length < 3) {
    throw new Error('Invalid query: uid is required');
  }

  return uid;
}

export async function GET(request: Request) {
  try {
    await ensureAdminAccess();
    const uid = readUidFromQuery(request);
    const role = await getUserRoleClaim(uid);

    return NextResponse.json({
      ok: true,
      data: {
        uid,
        role,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = message === 'Forbidden' ? 403 : 400;

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const adminSession = await ensureAdminAccess();
    const payload = parseUserRoleClaimPayload(await request.json());

    if (payload.uid === adminSession.uid) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Refusing to change your own role from this endpoint',
        },
        { status: 400 },
      );
    }

    await updateUserRoleClaim(payload.uid, payload.role);

    return NextResponse.json({
      ok: true,
      data: {
        uid: payload.uid,
        role: payload.role,
        note: 'Role claim updated. User must refresh/re-login to receive new token.',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = message === 'Forbidden' ? 403 : 400;

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status },
    );
  }
}
