import { put } from '@vercel/blob';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { assets } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/require-session';

const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4'];

// Two callers share this route:
// - Assets page ("+ Upload File"): multipart/form-data with a `file` field →
//   server-side put(), returns the new asset row. Bodies are capped at 4.5 MB
//   by Vercel Functions.
// - AssetPicker (block image fields): @vercel/blob/client upload() → JSON
//   events. `blob.generate-client-token` comes from the browser and needs a
//   session; `blob.upload-completed` comes from Vercel (no cookie) and is
//   verified by its x-vercel-signature inside handleUpload (proxy.ts lets it
//   through on that header).
export async function POST(request: Request): Promise<NextResponse> {
  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.includes('multipart/form-data')) {
    return handleFormUpload(request);
  }
  return handleClientUpload(request);
}

async function handleFormUpload(request: Request): Promise<NextResponse> {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'BLOB_NOT_CONFIGURED' }, { status: 503 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!ALLOWED_CONTENT_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `File type not allowed: ${file.type || 'unknown'}` }, { status: 415 });
    }

    const blob = await put(file.name, file, { access: 'public', addRandomSuffix: true });

    const [existing] = await db.select().from(assets).where(eq(assets.url, blob.url)).limit(1);
    if (existing) return NextResponse.json(existing);

    const [asset] = await db
      .insert(assets)
      .values({
        url: blob.url,
        pathname: blob.pathname,
        contentType: file.type || null,
        size: file.size,
        alt: '',
      })
      .returning();

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error('Asset upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

async function handleClientUpload(request: Request): Promise<NextResponse> {
  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (body.type === 'blob.generate-client-token') {
    const unauthorized = await requireSession();
    if (unauthorized) return unauthorized;
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({}),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('Blob upload completed', blob.pathname);

        // Save asset metadata to DB
        try {
          const [existing] = await db.select().from(assets).where(eq(assets.url, blob.url)).limit(1);
          if (!existing) {
            await db.insert(assets).values({
              url: blob.url,
              pathname: blob.pathname,
              contentType: blob.contentType,
              alt: '',
            });
          }
        } catch (dbError) {
          console.error('Failed to save asset to DB:', dbError);
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }, // The webhook will retry 5 times if you return 400
    );
  }
}
