import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pages, assets } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * POST /api/import/hydrate-images
 *
 * Accepts multipart/form-data:
 *   - pageJson      (string) — page builder JSON with {{IMAGE:filename.ext}} placeholders
 *   - createPage    (string) — "true" | "false"  (default: "false")
 *   - <any-name>    (File)   — one or more image files; each filename is matched against placeholders
 *
 * Returns:
 *   { hydratedJson, imageMap, pageId?, pageSlug?, urls? }
 *
 * Called from a Python Jupyter notebook:
 *   import requests
 *   r = requests.post(
 *       'http://localhost:3000/api/import/hydrate-images',
 *       data={'createPage': 'true'},
 *       files={
 *           'pageJson': ('page.json', open('atrium-root.json'), 'application/json'),
 *           'atrium-root.jpg': open('images/atrium-root.jpg', 'rb'),
 *       }
 *   )
 *   result = r.json()
 */
export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'BLOB_NOT_CONFIGURED' }, { status: 503 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 });
  }

  // ── 1. Extract pageJson ────────────────────────────────────────────────────
  const pageJsonRaw = formData.get('pageJson');
  if (!pageJsonRaw || typeof pageJsonRaw !== 'string') {
    return NextResponse.json(
      { error: 'Missing required field: pageJson (string)' },
      { status: 400 }
    );
  }

  const createPage = formData.get('createPage') === 'true';

  // ── 2. Upload image files & build filename → blob URL map ─────────────────
  const imageMap: Record<string, string> = {};
  const uploadErrors: string[] = [];

  for (const [key, value] of formData.entries()) {
    if (key === 'pageJson' || key === 'createPage') continue;
    if (!(value instanceof File)) continue;

    try {
      const blob = await put(value.name, value, {
        access: 'public',
        addRandomSuffix: true,
      });

      // Register in the assets library
      const [existing] = await db
        .select()
        .from(assets)
        .where(eq(assets.url, blob.url))
        .limit(1);
      if (!existing) {
        await db.insert(assets).values({
          url: blob.url,
          pathname: blob.pathname,
          contentType: value.type || null,
          alt: '',
        });
      }

      // Map both by the original filename and by the form field key
      imageMap[value.name] = blob.url;
      if (key !== value.name) {
        imageMap[key] = blob.url;
      }
    } catch (err) {
      uploadErrors.push(`Failed to upload ${value.name}: ${String(err)}`);
    }
  }

  if (uploadErrors.length > 0) {
    return NextResponse.json({ error: uploadErrors.join('; ') }, { status: 500 });
  }

  // ── 3. Replace {{IMAGE:filename.ext}} placeholders ────────────────────────
  let hydratedJson = pageJsonRaw;
  for (const [filename, url] of Object.entries(imageMap)) {
    // Replace both with and without path prefix variants
    const escaped = filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    hydratedJson = hydratedJson.replace(
      new RegExp(`\\{\\{IMAGE:${escaped}\\}\\}`, 'g'),
      url
    );
  }

  // ── 4. Optionally create / update the page in the DB ──────────────────────
  let pageId: string | undefined;
  let pageSlug: string | undefined;
  let productUrls: { fr: string; en: string } | undefined;

  if (createPage) {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(hydratedJson);
    } catch {
      return NextResponse.json(
        { error: 'pageJson is not valid JSON after image hydration' },
        { status: 400 }
      );
    }

    const title = (parsed.title as string) || 'Untitled Product';
    const slug = parsed.slug as string;
    if (!slug) {
      return NextResponse.json(
        { error: 'pageJson must include a top-level "slug" field (e.g. "produit-atrium-root")' },
        { status: 400 }
      );
    }

    const blocks = (parsed.blocks as { en: unknown[]; fr?: unknown[] }) ?? { en: [] };
    const meta = (parsed.meta as object) ?? {};

    const [existing] = await db
      .select({ id: pages.id })
      .from(pages)
      .where(eq(pages.slug, slug))
      .limit(1);

    if (existing) {
      // Update existing page (idempotent re-import)
      await db
        .update(pages)
        .set({
          title,
          draft_blocks: blocks,
          published_blocks: blocks,
          meta,
          status: 'published',
          publishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(pages.id, existing.id));
      pageId = existing.id;
    } else {
      // Create new page and immediately publish
      const [created] = await db
        .insert(pages)
        .values({
          title,
          slug,
          draft_blocks: blocks,
          published_blocks: blocks,
          meta,
          status: 'published',
          publishedAt: new Date(),
          isTemplate: false,
        })
        .returning({ id: pages.id, slug: pages.slug });
      pageId = created.id;
    }

    pageSlug = slug;

    // Derive the product slug (strip the "produit-" prefix) for URL building
    const productSlug = slug.startsWith('produit-') ? slug.slice('produit-'.length) : slug;
    productUrls = {
      fr: `/fr/produit/${productSlug}`,
      en: `/en/product/${productSlug}`,
    };

    // Bust ISR cache for both locale routes
    revalidatePath(`/fr/produit/${productSlug}`);
    revalidatePath(`/en/product/${productSlug}`);
  }

  return NextResponse.json({
    hydratedJson,
    imageMap,
    ...(createPage && { pageId, pageSlug, urls: productUrls }),
  });
}
