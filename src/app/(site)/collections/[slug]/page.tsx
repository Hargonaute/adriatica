import { notFound } from 'next/navigation';
import { db, collections, fields, entries, pages } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import Link from 'next/link';
import type { Metadata } from 'next';
import { RenderPreview } from '@/components/page-builder/renderPreview';
import { type Block } from '@/types';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

async function getData(slug: string) {
  const [col] = await db
    .select()
    .from(collections)
    .where(eq(collections.slug, slug))
    .limit(1);

  if (!col) return null;

  const [colFields, colEntries] = await Promise.all([
    db.select().from(fields).where(eq(fields.collectionId, col.id)).orderBy(fields.order),
    db.select().from(entries).where(eq(entries.collectionId, col.id)),
  ]);

  const [templatePage] = col.indexPageId
    ? await db
        .select()
        .from(pages)
        .where(and(eq(pages.id, col.indexPageId), eq(pages.status, 'published')))
        .limit(1)
    : [null];

  return { col, fields: colFields, entries: colEntries, templatePage };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getData(slug);
  if (!data) return {};
  if (data.templatePage?.meta) {
      const meta = data.templatePage.meta as Record<string, string>;
      if (meta.title) return { title: meta.title };
  }
  return { title: data.col.name };
}

export default async function CollectionListingPage({ params }: Props) {
  const { slug } = await params;
  const data = await getData(slug);
  if (!data) notFound();

  const { col, fields: colFields, entries: colEntries, templatePage } = data;

  // --- Template routing ---
  if (templatePage) {
    const blocks = ((templatePage.published_blocks as Record<string, any>)?.en ?? []) as Block[];
    return (
      <main className="min-h-screen bg-background">
        {blocks.map(block => (
          <RenderPreview key={block.id} block={block} />
        ))}
      </main>
    );
  }

  // --- Auto-template (default fallback) ---

  // Best fields to use as card title and image
  const titleField = colFields.find(f => f.type === 'text');
  const imageField = colFields.find(f => f.type === 'image');
  // Subtitle — first textarea or rich-text field
  const subtitleField = colFields.find(f => f.type === 'textarea' || f.type === 'rich-text');

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
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

      {/* Grid */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-8 pb-24">
        {colEntries.length === 0 ? (
          <p className="text-slate-500 text-center py-20">No items yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {colEntries.map(entry => {
              const itemData = entry.data as Record<string, any>;
              const title = titleField ? String(itemData[titleField.key] ?? '') : '';
              const imgUrl = imageField ? String(itemData[imageField.key] ?? '') : '';
              const subtitle = subtitleField
                ? String(itemData[subtitleField.key] ?? '').replace(/<[^>]*>/g, '').slice(0, 120)
                : '';

              return (
                <Link
                  key={entry.id}
                  href={`/collections/${slug}/${entry.slug ?? entry.id}`}
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
