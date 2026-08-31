import {v2 as cloudinary} from 'cloudinary';
import {NextResponse} from 'next/server';
import {withAuth} from '@/src/lib/utils/auth-api';

export const runtime = 'nodejs';

export const POST = withAuth(async (request, context) => {
  const body = (await request.json()) as {
    folder?: string;
    timestamp?: number;
  };

  // `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` adalah satu-satunya var cloud name
  // yang ada di .env.local — sebelumnya route ini baca `CLOUDINARY_CLOUD_NAME`
  // (tanpa prefix) yang gak pernah ke-set, jadi selalu gagal dengan 500 tiap
  // dipanggil (makanya gak ada satupun fitur upload yang pernah kepake).
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      {ok: false, error: 'Cloudinary server configuration is missing.'},
      {status: 500},
    );
  }

  const timestamp = body.timestamp ?? Math.floor(Date.now() / 1000);
  // Route ini sekarang admin-only — foldernya buat aset yang admin kelola
  // (informasi/credit/destinasi), bukan per-user lagi.
  const folder = body.folder ?? `nusaquest/admin/${context.claims.uid}`;

  const signature = cloudinary.utils.api_sign_request(
    {
      folder,
      timestamp,
    },
    apiSecret,
  );

  return NextResponse.json({
    ok: true,
    signature,
    timestamp,
    folder,
    cloudName,
    apiKey,
  });
}, { requireAdmin: true });
