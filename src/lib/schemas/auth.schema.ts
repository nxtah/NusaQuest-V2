/**
 * @file auth.schema.ts
 * @description Zod validation schemas untuk domain Auth.
 * Digunakan di API routes untuk validasi request body.
 */

import { z } from 'zod';

// ─── Session ──────────────────────────────────────────────────────────────────

/** Schema untuk validasi POST /api/auth/session */
export const CreateSessionSchema = z.object({
  idToken: z.string().min(1, 'idToken tidak boleh kosong'),
});

// ─── User Role Claim (Admin API) ──────────────────────────────────────────────

/** Schema untuk validasi PATCH /api/admin/users/role */
export const UserRoleClaimSchema = z.object({
  uid:  z.string().min(1, 'uid tidak boleh kosong'),
  role: z.enum(['admin', 'user']),
});

/**
 * Parse dan validasi payload untuk update user role claim.
 * Melempar error jika data tidak valid.
 * @param payload - Raw JSON body dari request
 */
export function parseUserRoleClaimPayload(payload: unknown) {
  return UserRoleClaimSchema.parse(payload);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type CreateSessionPayload  = z.infer<typeof CreateSessionSchema>;
export type UserRoleClaimPayload  = z.infer<typeof UserRoleClaimSchema>;
