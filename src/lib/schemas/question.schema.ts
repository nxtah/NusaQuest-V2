import {z} from 'zod';

export const questionChoiceSchema = z.object({
  answer_text: z.string().min(1),
  is_correct: z.boolean(),
});

export const questionRecordSchema = z.object({
  question_text: z.string().min(1),
  multiple_choices: z
    .record(z.string(), questionChoiceSchema)
    .refine((choices) => Object.keys(choices).length >= 1, {
      message: 'At least one choice is required',
    }),
  topic: z.string().min(1),
  gameId: z.string().min(1).optional(),
  createdBy: z.string().min(1).optional(),
  destination: z.string().min(1).optional(),
  hint: z.string().min(1).optional(),
  createdAt: z.number().int().nonnegative().optional(),
  updatedAt: z.number().int().nonnegative().optional(),
});

export const questionUpsertSchema = z
  .object({
    question: z.string().min(1).optional(),
    answer: z.string().min(1).optional(),
    topic: z.string().min(1),
    gameId: z.string().min(1),
    question_text: z.string().min(1).optional(),
    multiple_choices: z.record(z.string(), questionChoiceSchema).optional(),
    destination: z.string().min(1).optional(),
    hint: z.string().min(1).optional(),
  })
  .refine((data) => Boolean(data.question || data.question_text), {
    message: 'question or question_text is required',
    path: ['question'],
  });

export const questionPatchSchema = z
  .object({
    question: z.string().min(1).optional(),
    answer: z.string().min(1).optional(),
    topic: z.string().min(1).optional(),
    gameId: z.string().min(1).optional(),
    question_text: z.string().min(1).optional(),
    multiple_choices: z.record(z.string(), questionChoiceSchema).optional(),
    destination: z.string().min(1).optional(),
    hint: z.string().min(1).optional(),
  })
  .refine(
    (data) =>
      Boolean(
        data.question ||
        data.question_text ||
        data.answer ||
        data.topic ||
        data.gameId ||
        data.multiple_choices ||
        data.destination ||
        data.hint,
      ),
    {
      message: 'At least one field must be provided',
      path: ['question'],
    },
  );

export const questionSchema = questionUpsertSchema;
