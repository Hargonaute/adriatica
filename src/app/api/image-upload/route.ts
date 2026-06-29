import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

/** Quick check: is Vercel Blob configured? */
export async function GET() {
  return NextResponse.json({ blobConfigured: !!process.env.BLOB_READ_WRITE_TOKEN });
}

/** Server-side upload: accepts multipart/form-data with a `file` field. */
export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'BLOB_NOT_CONFIGURED' },
      { status: 503 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const blob = await put(file.name, file, { access: 'public' });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
