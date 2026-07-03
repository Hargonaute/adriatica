import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth/auth';
import { republishAllTemplates } from '@/lib/db/republishTemplates';

// POST /api/admin/republish-templates
// One-time migration: forces every template page's published_blocks to match
// its draft_blocks so pre-auto-publish templates go live. Allowed in dev, or
// with a valid dashboard session in any environment.
export async function POST(request: Request) {
  try {
    const isDev = process.env.NODE_ENV === 'development';
    let authorized = isDev;

    if (!authorized) {
      const session = await auth.api.getSession({ headers: request.headers });
      authorized = !!session;
    }

    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updated = await republishAllTemplates();

    revalidatePath('/collections', 'layout');

    return NextResponse.json({
      success: true,
      count: updated.length,
      updated,
    });
  } catch (error) {
    console.error('Error republishing templates:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
