import {NextResponse} from 'next/server';
import {questionSchema} from '@/src/lib/schemas/question.schema';
import {getFirebaseAdminDb} from '@/src/lib/firebase/admin';
import {withAuth} from '@/src/lib/utils/auth-api';

export const runtime = 'nodejs';

export const GET = withAuth(async () => {
  const snapshot = await getFirebaseAdminDb().ref('questions').get();
  const value = snapshot.exists() ? snapshot.val() : {};
  return NextResponse.json({ok: true, data: value});
}, {requireAdmin: true});

export const POST = withAuth(
  async (request, context) => {
    const payload = questionSchema.parse(await request.json());
    const record = {
      ...payload,
      createdBy: context.claims.uid,
      createdAt: Date.now(),
    };

    const ref = getFirebaseAdminDb().ref('questions').push();
    await ref.set(record);

    return NextResponse.json({ok: true, id: ref.key, data: record}, {status: 201});
  },
  {requireAdmin: true},
);
