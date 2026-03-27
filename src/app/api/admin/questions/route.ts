import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { parseQuestionPayload } from '../../../../lib/schemas/question.schema';
import { getData, pushData } from '../../../../services/firebase/rtdb/base.service';
import { verifyServerSession } from '../../../../lib/utils/server-session';

function ensureAdminAccess() {
  return cookies().then((store) => {
    return verifyServerSession(store).then((session) => {
      if (!session.authenticated || session.role !== 'admin') {
        throw new Error('Forbidden');
      }
    });
  });
}

export async function GET() {
  try {
    await ensureAdminAccess();

    const result = await getData<Record<string, unknown>>('questions');
    return NextResponse.json({
      ok: result.success,
      route: 'admin/questions',
      data: result.data,
      error: result.error,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureAdminAccess();

    const payload = parseQuestionPayload(await request.json());
    const result = await pushData('questions', {
      ...payload,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return NextResponse.json(
      {
        ok: result.success,
        data: result.data,
        error: result.error,
      },
      { status: result.success ? 201 : 400 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
