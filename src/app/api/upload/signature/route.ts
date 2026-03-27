import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

type UploadSignaturePayload = {
  folder?: string;
  public_id?: string;
};

export async function POST(request: Request) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Missing Cloudinary server credentials',
      },
      { status: 500 },
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  try {
    const body = (await request.json()) as UploadSignaturePayload;
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign: Record<string, string | number> = {
      timestamp,
      folder: body.folder ?? 'nusaquest/uploads',
    };

    if (body.public_id) {
      paramsToSign.public_id = body.public_id;
    }

    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    return NextResponse.json({
      ok: true,
      route: 'upload/signature',
      signature,
      timestamp,
      cloudName,
      apiKey,
      folder: paramsToSign.folder,
      public_id: paramsToSign.public_id ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
