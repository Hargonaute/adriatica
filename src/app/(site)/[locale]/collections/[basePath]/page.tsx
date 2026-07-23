import { notFound } from 'next/navigation';
import { db, collections, fields, entries, pages } from '@/lib/db';
import { and, eq, or, isNull, desc } from 'drizzle-orm';
import Link from 'next/link';
import type { Metadata } from 'next';
import { RenderPreview } from '@/components/page-builder/renderPreview';
import { type Block } from '@/types';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { loadCommon } from '@/lib/i18n/loadPageData';

export const revalidate = 60;

interface Props {
  params: Promise<{ locale: string; basePath: string }>;
}

async function getData(basePath: string) {
  const [col] = await db
    .select()
    .from(collections)
    .where(
      or(
        eq(collections.basePath, basePath),
        and(isNull(collections.basePath), eq(collections.slug, basePath))
      )
    )
    .limit(1);

  if (!col) return null;

  const [colFields, colEntries, templatePage] = await Promise.all([
    db.select().from(fields).where(eq(fields.collectionId, col.id)).orderBy(fields.order),
    db
      .select()
      .from(entries)
      .where(and(eq(entries.collectionId, col.id), eq(entries.status, 'published')))
      .orderBy(desc(entries.createdAt)),
    col.indexPageId
      ? db
          .select()
          .from(pages)
          .where(and(eq(pages.id, col.indexPageId), eq(pages.status, 'published')))
          .limit(1)
          .then((rows) => rows[0] ?? null)
      : Promise.resolve(null),
  ]);

  return { col, fields: colFields, entries: colEntries, templatePage };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { basePath } = await params;
  const data = await getData(basePath);
  if (!data) return {};
  const meta = (data.templatePage?.meta ?? {}) as Record<string, string>;
  return { title: meta.title || data.col.name };
}

export default async function CollectionIndexPage({ params }: Props) {
  const { locale, basePath } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;

  const data = await getData(basePath);
  if (!data) notFound();

  const common = loadCommon(L);
  const { col, fields: colFields, entries: colEntries, templatePage } = data;

  if (templatePage) {
    const blocks = ((templatePage.published_blocks as Record<Locale, Block[]> | null)?.[L] ?? []) as Block[];
    return (
      <main className="min-h-screen bg-background">
        {blocks.map((block) => (
          <RenderPreview key={block.id} block={block} />
        ))}
      </main>
    );
  }

  const titleField = colFields.find((f) => f.type === 'text');
  const imageField = colFields.find((f) => f.type === 'image');
  const subtitleField = colFields.find((f) => f.type === 'textarea' || f.type === 'rich-text');
  const linkBase = `/${L}/collections/${col.basePath ?? col.slug}`;
  const itemLabel = colEntries.length === 1 ? common.site.itemSingular : common.site.itemPlural;

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-white w-full pt-16 pb-12 xl:pt-24">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <Link href={`/${L}`} className="hover:text-[#BC0D2A] transition-colors">
              {common.site.homeCrumb}
            </Link>
            <span>/</span>
            <span className="text-slate-900 capitalize">{col.name}</span>
          </nav>
          <h1 className="font-[family-name:var(--font-inter)] text-4xl sm:text-5xl font-bold text-slate-900 leading-[1.1] tracking-tight">
            {col.name}
          </h1>
          <p className="text-[17px] text-slate-500 font-medium mt-4">
            {colEntries.length} {itemLabel}
          </p>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {colEntries.length === 0 ? (
          <p className="text-slate-500 text-center py-20">{common.site.noItemsYet}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {colEntries.map((entry) => {
              const itemData = entry.data as Record<string, unknown>;
              const title = titleField ? String(itemData[titleField.key] ?? '') : '';
              const imgUrl = imageField ? String(itemData[imageField.key] ?? '') : '';
              const subtitle = subtitleField
                ? String(itemData[subtitleField.key] ?? '').replace(/<[^>]*>/g, '').slice(0, 120)
                : '';
              const href = `${linkBase}/${entry.slug ?? entry.id}`;

              return (
                <Link
                  key={entry.id}
                  href={href}
                  className="group rounded-2xl border bg-white overflow-hidden hover:shadow-lg hover:border-slate-200 transition-all"
                >
                  {imgUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgUrl} alt={title} className="w-full aspect-video object-cover" loading="lazy" />
                  )}
                  <div className="p-6">
                    {title && (
                      <h2 className="font-semibold text-lg text-slate-900 group-hover:text-[#BC0D2A] transition-colors leading-snug mb-2">
                        {title}
                      </h2>
                    )}
                    {subtitle && <p className="text-sm text-slate-500 line-clamp-3">{subtitle}</p>}
                    <p className="text-xs text-slate-400 mt-3">
                      {new Date(entry.createdAt).toLocaleDateString(L === 'fr' ? 'fr-FR' : 'en-US')}
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
