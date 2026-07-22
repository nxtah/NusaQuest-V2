import {z} from 'zod';

export const questionRecordSchema = z.object({
  mapId: z.string().min(1),
  regionId: z.string().min(1),
  text: z.string().min(1),
  options: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1), z.string().min(1)]),
  correctIndex: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  difficulty: z.literal('easy').default('easy'),
  isActive: z.boolean().default(true),
  isApproved: z.boolean().default(false),
  generatedBy: z.enum(['ai', 'manual']).default('manual'),
});

export const questionSchema = questionRecordSchema;

export const questionPatchSchema = questionRecordSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  {message: 'At least one field must be provided'},
);
