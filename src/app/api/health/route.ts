import { NextResponse } from 'next/server';

const requiredEnvKeys = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_DATABASE_URL',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
] as const;

export async function GET() {
  const missingEnvKeys = requiredEnvKeys.filter((key) => !process.env[key]);

  return NextResponse.json({
    ok: missingEnvKeys.length === 0,
    service: 'nusaquest-firebase-health',
    missingEnvKeys,
    timestamp: new Date().toISOString(),
  });
}
