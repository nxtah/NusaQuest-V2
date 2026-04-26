/**
 * @file route.ts — /api/health
 * @description Health check endpoint untuk memverifikasi server berjalan normal.
 * GET /api/health → { status: "ok", timestamp: ... }
 */

import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status:    'ok',
    service:   'NusaQuest API',
    timestamp: new Date().toISOString(),
  });
}
