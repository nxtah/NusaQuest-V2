import {v2 as cloudinary} from 'cloudinary';
import {NextResponse} from 'next/server';
import {withAuth} from '@/src/lib/utils/auth-api';

export const runtime = 'nodejs';

export const POST = withAuth(async (request, context) => {
  const body = (await request.json()) as {
    folder?: string;
    timestamp?: number;
  };

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      {ok: false, error: 'Cloudinary server configuration is missing.'},
      {status: 500},
    );
  }

  const timestamp = body.timestamp ?? Math.floor(Date.now() / 1000);
  const folder = body.folder ?? `nusaquest/users/${context.claims.uid}`;

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
});
