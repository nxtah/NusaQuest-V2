import {z} from 'zod';

export const sessionTokenSchema = z.object({
  idToken: z.string().min(1, 'idToken is required'),
});

export const loginPayloadSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().min(1),
});
