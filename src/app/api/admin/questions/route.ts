import {NextResponse} from 'next/server';
import {
  questionPatchSchema,
  questionSchema,
} from '@/src/lib/schemas/question.schema';
import {getFirebaseAdminFirestore} from '@/src/lib/firebase/admin';
import {withAuth} from '@/src/lib/utils/auth-api';

export const runtime = 'nodejs';

const QUESTIONS_COLLECTION = 'questions';

export const GET = withAuth(async (request) => {
  const url = new URL(request.url);
  const mapId = url.searchParams.get('mapId');
  const regionId = url.searchParams.get('regionId');

  let query = getFirebaseAdminFirestore().collection(QUESTIONS_COLLECTION) as FirebaseFirestore.Query;
  if (mapId) query = query.where('mapId', '==', mapId);
  if (regionId) query = query.where('regionId', '==', regionId);

  const snapshot = await query.get();
  const data = snapshot.docs.map((doc) => ({questionId: doc.id, ...doc.data()}));

  return NextResponse.json({ok: true, data});
}, {requireAdmin: true});

export const POST = withAuth(
  async (request, context) => {
    const payload = questionSchema.parse(await request.json());
    const record = {
      ...payload,
      createdAt: Date.now(),
      createdBy: context.claims.uid,
    };

    const ref = await getFirebaseAdminFirestore().collection(QUESTIONS_COLLECTION).add(record);

    return NextResponse.json({ok: true, id: ref.id, data: record}, {status: 201});
  },
  {requireAdmin: true},
);

export const PATCH = withAuth(
  async (request, context) => {
    const url = new URL(request.url);
    const id = (url.searchParams.get('id') ?? '').trim();

    if (!id) {
      return NextResponse.json({ok: false, error: 'id is required'}, {status: 400});
    }

    const payload = questionPatchSchema.parse(await request.json());
    const ref = getFirebaseAdminFirestore().collection(QUESTIONS_COLLECTION).doc(id);
    const snapshot = await ref.get();

    if (!snapshot.exists) {
      return NextResponse.json({ok: false, error: 'Question not found'}, {status: 404});
    }

    const updates = {
      ...payload,
      approvedBy: payload.isApproved ? context.claims.uid : undefined,
      approvedAt: payload.isApproved ? Date.now() : undefined,
    };

    await ref.update(updates);

    return NextResponse.json({ok: true, id, data: updates});
  },
  {requireAdmin: true},
);

export const DELETE = withAuth(
  async (request) => {
    const url = new URL(request.url);
    const id = (url.searchParams.get('id') ?? '').trim();

    if (!id) {
      return NextResponse.json({ok: false, error: 'id is required'}, {status: 400});
    }

    const ref = getFirebaseAdminFirestore().collection(QUESTIONS_COLLECTION).doc(id);
    const snapshot = await ref.get();

    if (!snapshot.exists) {
      return NextResponse.json({ok: false, error: 'Question not found'}, {status: 404});
    }

    await ref.delete();

    return NextResponse.json({ok: true, id});
  },
  {requireAdmin: true},
);
