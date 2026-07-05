import {NextResponse} from 'next/server';
import {
  questionPatchSchema,
  questionSchema,
  type questionRecordSchema,
} from '@/src/lib/schemas/question.schema';
import {getFirebaseAdminDb} from '@/src/lib/firebase/admin';
import {withAuth} from '@/src/lib/utils/auth-api';

export const runtime = 'nodejs';

function buildQuestionRecord(payload: ReturnType<typeof questionSchema.parse>, uid?: string) {
  const questionText = payload.question ?? payload.question_text ?? '';
  const answerText = payload.answer ?? '';

  return {
    question_text: payload.question_text ?? questionText,
    multiple_choices:
      payload.multiple_choices ?? {
        A: {
          answer_text: answerText || questionText,
          is_correct: true,
        },
      },
    topic: payload.topic,
    gameId: payload.gameId,
    createdBy: uid,
    destination: payload.destination,
    hint: payload.hint,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export const GET = withAuth(async () => {
  const snapshot = await getFirebaseAdminDb().ref('questions').get();
  const value = snapshot.exists() ? snapshot.val() : {};
  return NextResponse.json({ok: true, data: value});
}, {requireAdmin: true});

export const POST = withAuth(
  async (request, context) => {
    const payload = questionSchema.parse(await request.json());
    const record = buildQuestionRecord(payload, context.claims.uid);

    const ref = getFirebaseAdminDb().ref('questions').push();
    await ref.set(record);

    return NextResponse.json({ok: true, id: ref.key, data: record}, {status: 201});
  },
  {requireAdmin: true},
);

export const PATCH = withAuth(
  async (request) => {
    const url = new URL(request.url);
    const id = (url.searchParams.get('id') ?? '').trim();

    if (!id) {
      return NextResponse.json({ok: false, error: 'id is required'}, {status: 400});
    }

    const payload = questionPatchSchema.parse(await request.json());
    const ref = getFirebaseAdminDb().ref(`questions/${id}`);
    const snapshot = await ref.get();

    if (!snapshot.exists()) {
      return NextResponse.json({ok: false, error: 'Question not found'}, {status: 404});
    }

    const current = snapshot.val() as Record<string, unknown>;
    const nextQuestionText = payload.question_text ?? payload.question ?? (current.question_text as string | undefined) ?? '';
    const nextAnswerText = payload.answer ?? '';
    const nextTopic = payload.topic ?? (current.topic as string | undefined) ?? '';

    const nextRecord = {
      ...current,
      ...(payload.question !== undefined ? {question: payload.question} : {}),
      ...(payload.answer !== undefined ? {answer: payload.answer} : {}),
      ...(payload.topic !== undefined ? {topic: payload.topic} : {}),
      ...(payload.gameId !== undefined ? {gameId: payload.gameId} : {}),
      ...(payload.question_text !== undefined ? {question_text: payload.question_text} : {}),
      ...(payload.multiple_choices !== undefined ? {multiple_choices: payload.multiple_choices} : {}),
      ...(payload.destination !== undefined ? {destination: payload.destination} : {}),
      ...(payload.hint !== undefined ? {hint: payload.hint} : {}),
      question_text: nextQuestionText,
      multiple_choices:
        payload.multiple_choices ??
        current.multiple_choices ??
        {
          A: {
            answer_text: nextAnswerText || nextQuestionText,
            is_correct: true,
          },
        },
      topic: nextTopic,
      updatedAt: Date.now(),
    };

    await ref.update(nextRecord);

    return NextResponse.json({ok: true, id, data: nextRecord});
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

    const ref = getFirebaseAdminDb().ref(`questions/${id}`);
    const snapshot = await ref.get();

    if (!snapshot.exists()) {
      return NextResponse.json({ok: false, error: 'Question not found'}, {status: 404});
    }

    await ref.remove();

    return NextResponse.json({ok: true, id});
  },
  {requireAdmin: true},
);
