import { NextResponse } from 'next/server';
import { loadProductFilterItems } from '@/lib/products/loadProductFilterItems';

// GET /api/products — public, read-only list of filterable products for the
// site search. The "Trouver une solution" page renders server-side from the
// same loader. Only published, non-template product pages: the legacy
// "produit" collection is no longer merged in (an unpublished page used to
// come back as a dead collection card).
export async function GET() {
  try {
    const items = await loadProductFilterItems();
    return NextResponse.json(items, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (error) {
    console.error('Error loading products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
