import {z} from 'zod';

export const gameStateSchema = z.object({
  roomId: z.string().min(1),
  topicId: z.string().min(1),
  gameId: z.string().min(1),
  status: z.enum(['waiting', 'playing', 'finished']),
  currentPlayerIndex: z.number().int().min(0).optional(),
});
