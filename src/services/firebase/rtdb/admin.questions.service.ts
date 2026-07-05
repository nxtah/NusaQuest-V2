import {getData, updateData, removeData, pushData} from './base.service';
import {toFailure, toSuccess, type AppResult} from '@/src/utils/result';

export interface QuestionChoice {
  answer_text: string;
  is_correct: boolean;
}

export interface QuestionRecord {
  question_text: string;
  multiple_choices: Record<string, QuestionChoice>;
  topic: string;
  gameId?: string;
  createdBy?: string;
  destination?: string;
  hint?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface Question {
  id?: string;
  question: string;
  answer: string;
  topic: string;
  gameId?: string;
  question_text?: string;
  multiple_choices?: Record<string, QuestionChoice>;
  hint?: string;
  destination?: string;
  createdAt?: number;
  updatedAt?: number;
}

function getQuestionText(question: Partial<Question> | Partial<QuestionRecord>) {
  if ('question' in question && question.question) {
    return question.question;
  }

  return (
    question.question_text ??
    (question as {text?: string}).text ??
    ''
  );
}

function getQuestionAnswer(question: Partial<Question> | Partial<QuestionRecord>) {
  if ('answer' in question && question.answer) return question.answer;

  const choices = question.multiple_choices;
  if (choices) {
    const correctChoice = Object.values(choices).find((choice) => choice.is_correct);
    if (correctChoice?.answer_text) return correctChoice.answer_text;
  }

  return '';
}

function getQuestionTopic(question: Partial<Question> | Partial<QuestionRecord>) {
  return question.topic ?? '';
}

function toQuestionViewModel(
  id: string,
  record: QuestionRecord | Partial<Question> | null | undefined,
): Question {
  return {
    id,
    question: getQuestionText(record ?? {}),
    answer: getQuestionAnswer(record ?? {}),
    topic: getQuestionTopic(record ?? {}),
    gameId: record?.gameId,
    question_text: record?.question_text,
    multiple_choices: record?.multiple_choices,
    hint: record?.hint,
    destination: record?.destination,
    createdAt: record?.createdAt,
    updatedAt: record?.updatedAt,
  };
}

function toQuestionRecord(
  payload: Omit<Question, 'id' | 'gameId'>,
  gameId: string,
): QuestionRecord {
  const questionText = getQuestionText(payload);
  const answerText = getQuestionAnswer(payload);
  const topic = getQuestionTopic(payload);

  return {
    question_text: questionText,
    multiple_choices:
      payload.multiple_choices ?? {
        A: {answer_text: answerText || questionText || 'Jawaban benar', is_correct: true},
      },
    topic,
    gameId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy: (payload as {createdBy?: string}).createdBy,
    destination: payload.destination,
    hint: payload.hint,
  };
}

export async function getGameQuestions(
  gameId: string,
): Promise<AppResult<Record<string, Question> | null>> {
  const result = await getData<Record<string, QuestionRecord | Question>>('questions');

  if (!result.success || !result.data) {
    return toFailure(result.error);
  }

  const filtered = Object.entries(result.data)
    .filter(([, question]) => !question.gameId || question.gameId === gameId)
    .reduce(
      (acc, [key, question]) => {
        acc[key] = toQuestionViewModel(key, question);
        return acc;
      },
      {} as Record<string, Question>,
    );

  return toSuccess(Object.keys(filtered).length > 0 ? filtered : null);
}

/**
 * Get a single question by ID
 */
export async function getQuestion(
  gameId: string,
  questionId: string,
): Promise<AppResult<Question | null>> {
  const result = await getData<QuestionRecord | Question>(`questions/${questionId}`);

  if (!result.success || !result.data) {
    return toFailure(result.error);
  }

  if (result.data.gameId && result.data.gameId !== gameId) {
    return toSuccess<Question | null>(null);
  }

  return toSuccess(toQuestionViewModel(questionId, result.data));
}

/**
 * Create a new question
 */
export async function createQuestion(
  gameId: string,
  question: Omit<Question, 'id' | 'gameId'>,
): Promise<AppResult<{id: string}>> {
  return pushData('questions', {
    ...toQuestionRecord(question, gameId),
  } as QuestionRecord);
}

/**
 * Update an existing question
 */
export async function updateQuestion(
  gameId: string,
  questionId: string,
  updates: Partial<Omit<Question, 'id' | 'gameId'>>,
): Promise<AppResult<Partial<Question>>> {
  return updateData(`questions/${questionId}`, {
    ...updates,
    question_text: getQuestionText(updates),
    multiple_choices:
      updates.multiple_choices ?? {
        A: {
          answer_text: getQuestionAnswer(updates) || getQuestionText(updates) || 'Jawaban benar',
          is_correct: true,
        },
      },
    topic: getQuestionTopic(updates),
    gameId,
    updatedAt: Date.now(),
  } as Partial<QuestionRecord>);
}

/**
 * Delete a question
 */
export async function deleteQuestion(
  gameId: string,
  questionId: string,
): Promise<AppResult<null>> {
  return removeData(`questions/${questionId}`);
}

/**
 * Bulk update multiple questions
 */
export async function bulkUpdateQuestions(
  gameId: string,
  updates: Record<string, Partial<Omit<Question, 'id' | 'gameId'>>>,
): Promise<AppResult<Record<string, unknown>>> {
  const bulkUpdates: Record<string, unknown> = {};

  Object.entries(updates).forEach(([id, data]) => {
    bulkUpdates[`questions/${id}`] = {
      ...data,
      updatedAt: Date.now(),
    };
  });

  return updateData('/', bulkUpdates as Record<string, unknown>);
}
