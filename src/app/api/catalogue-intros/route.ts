import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/auth/require-session';
import { getCatalogueIntros, saveCatalogueIntros } from '@/lib/products/catalogueIntrosStore';
import { LOCALES } from '@/lib/i18n/config';
import { pathForKey } from '@/lib/i18n/pageSlugs';

// Dashboard only (Catalogue → Intros): read / replace the intro texts of the
// filtered catalogue pages. Stored in a reserved, never-public `pages` row
// (see src/lib/products/catalogueIntros.ts). Both methods need a session.

export async function GET() {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;
  return NextResponse.json(await getCatalogueIntros());
}

export async function PUT(request: Request) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Expected { famille: {…}, culture: {…} }' }, { status: 400 });
  }

  try {
    const saved = await saveCatalogueIntros(body);
    LOCALES.forEach((l) => revalidatePath(pathForKey('solution', l)));
    return NextResponse.json(saved);
  } catch (error) {
    console.error('catalogue intros: save failed', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
