import { db, pages, collections, entries, fields } from '@/lib/db';
import { eq, and, or, isNull, desc } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { RenderPreview } from '@/components/page-builder/renderPreview';
import { type Block } from '@/types';
import { Metadata } from 'next';

// Revalidate every minute or use on-demand revalidation in the publish API
export const revalidate = 60;

async function loadPage(slug: string) {
  // Standalone published pages only — template pages live at internal slugs and
  // must not be reachable through the public dynamic route.
  const [result] = await db
    .select()
    .from(pages)
    .where(and(eq(pages.slug, slug), eq(pages.status, 'published'), eq(pages.isTemplate, false)))
    .limit(1);
  return result ?? null;
}

async function loadCollectionIndex(slug: string) {
  const [col] = await db
    .select()
    .from(collections)
    .where(
      or(
        eq(collections.basePath, slug),
        and(isNull(collections.basePath), eq(collections.slug, slug))
      )
    )
    .limit(1);
  if (!col) return null;

  const templatePage = col.indexPageId
    ? (await db
        .select()
        .from(pages)
        .where(and(eq(pages.id, col.indexPageId), eq(pages.status, 'published')))
        .limit(1))[0] ?? null
    : null;

  return { col, templatePage };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await loadPage(slug);
  if (page) {
    const meta = (page.meta ?? {}) as Record<string, string> & { ogImage?: string; noIndex?: boolean };
    return {
      title: meta.title || page.title,
      description: meta.description,
      openGraph: {
        images: meta.ogImage ? [meta.ogImage] : [],
      },
      robots: meta.noIndex ? { index: false } : undefined,
    };
  }

  const idx = await loadCollectionIndex(slug);
  if (idx) {
    const meta = (idx.templatePage?.meta ?? {}) as Record<string, string>;
    return { title: meta.title || idx.col.name };
  }

  return {};
}

export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // 1) Standalone page match wins first.
  const page = await loadPage(slug);
  if (page) {
    const blocks = (page.published_blocks as { en?: Block[] } | null)?.en ?? [];
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-16">
          {blocks.map(block => (
            <RenderPreview key={block.id} block={block} />
          ))}
        </div>
      </main>
    );
  }

  // 2) Otherwise treat the slug as a collection basePath.
  const idx = await loadCollectionIndex(slug);
  if (!idx) notFound();

  const { col, templatePage } = idx;
  const basePath = col.basePath ?? col.slug;

  // Index template exists and is published — render it.
  if (templatePage) {
    const blocks = ((templatePage.published_blocks as { en?: Block[] } | null)?.en ?? []) as Block[];
    return (
      <main className="min-h-screen bg-background">
        {blocks.map(block => (
          <RenderPreview key={block.id} block={block} />
        ))}
      </main>
    );
  }

  // Fallback: auto-generated listing so collections without an index template still render.
  const [colFields, colEntries] = await Promise.all([
    db.select().from(fields).where(eq(fields.collectionId, col.id)).orderBy(fields.order),
    db
      .select()
      .from(entries)
      .where(and(eq(entries.collectionId, col.id), eq(entries.status, 'published')))
      .orderBy(desc(entries.createdAt)),
  ]);

  const titleField = colFields.find(f => f.type === 'text');
  const imageField = colFields.find(f => f.type === 'image');
  const subtitleField = colFields.find(f => f.type === 'textarea' || f.type === 'rich-text');

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-white w-full pt-16 pb-12 xl:pt-24">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <Link href="/" className="hover:text-[#BC0D2A] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-slate-900 capitalize">{col.name}</span>
          </nav>
          <h1 className="font-[family-name:var(--font-inter)] text-4xl sm:text-5xl font-bold text-slate-900 leading-[1.1] tracking-tight">
            {col.name}
          </h1>
          <p className="text-[17px] text-slate-500 font-medium mt-4">
            {colEntries.length} item{colEntries.length !== 1 ? 's' : ''}
          </p>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 lg:px-8 pb-24">
        {colEntries.length === 0 ? (
          <p className="text-slate-500 text-center py-20">No items yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {colEntries.map(entry => {
              const itemData = entry.data as Record<string, unknown>;
              const title = titleField ? String(itemData[titleField.key] ?? '') : '';
              const imgUrl = imageField ? String(itemData[imageField.key] ?? '') : '';
              const subtitle = subtitleField
                ? String(itemData[subtitleField.key] ?? '').replace(/<[^>]*>/g, '').slice(0, 120)
                : '';
              const href = `/${basePath}/${entry.slug ?? entry.id}`;

              return (
                <Link
                  key={entry.id}
                  href={href}
                  className="group rounded-2xl border bg-white overflow-hidden hover:shadow-lg hover:border-slate-200 transition-all"
                >
                  {imgUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imgUrl}
                      alt={title}
                      className="w-full aspect-video object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="p-6">
                    {title && (
                      <h2 className="font-semibold text-lg text-slate-900 group-hover:text-[#BC0D2A] transition-colors leading-snug mb-2">
                        {title}
                      </h2>
                    )}
                    {subtitle && (
                      <p className="text-sm text-slate-500 line-clamp-3">{subtitle}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-3">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
