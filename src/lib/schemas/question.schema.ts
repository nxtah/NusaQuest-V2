import {z} from 'zod';

export const questionSchema = z.object({
  text: z.string().min(10),
  options: z.array(z.string().min(1)).min(2).max(4),
  correctAnswerIndex: z.number().int().min(0).max(3),
  topicId: z.string().min(1),
  gameId: z.string().min(1),
});
