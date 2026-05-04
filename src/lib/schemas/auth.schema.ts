import {z} from 'zod';

const userRoleSchema = z.enum(['user', 'admin']);

export const sessionTokenSchema = z.object({
  idToken: z.string().min(1, 'idToken is required'),
});

export const loginPayloadSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().min(1),
});

export function parseUserRoleClaimPayload(input: unknown): {uid: string; role: 'user' | 'admin'} {
  const schema = z.object({
    uid: z.string().min(3, 'uid is required'),
    role: userRoleSchema,
  });

  return schema.parse(input);
}
