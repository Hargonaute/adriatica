import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth/auth';
import { backfillMissingEntrySlugs } from '@/lib/db/backfillEntrySlugs';

// POST /api/admin/backfill-entry-slugs
// One-time migration: assign a generated slug to every entry that has none,
// so detail URLs stop falling back to /collections/{basePath}/{uuid}.
// Allowed in dev, or with a valid dashboard session in any environment.
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

    const backfilled = await backfillMissingEntrySlugs();

    revalidatePath('/collections', 'layout');

    return NextResponse.json({
      success: true,
      count: backfilled.length,
      backfilled,
    });
  } catch (error) {
    console.error('Error backfilling entry slugs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
