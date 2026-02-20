import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { assets } from '@/lib/db/schema';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Authenticate request here if needed
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4'],
          tokenPayload: JSON.stringify({
            // optional payload to pass to onUploadCompleted
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Blob upload completed', blob);

        // Save asset metadata to DB
        try {
          await db.insert(assets).values({
            url: blob.url,
            pathname: blob.pathname,
            contentType: blob.contentType,
            alt: '', // Initial empty alt, user can update later
          });
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
