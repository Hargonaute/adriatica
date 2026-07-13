import { db, pages, collections, entries, fields } from '@/lib/db';
import { eq, and, or, isNull, desc } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { RenderPreview } from '@/components/page-builder/renderPreview';
import { type Block } from '@/types';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { keyForSlug } from '@/lib/i18n/pageSlugs';
import { loadCommon } from '@/lib/i18n/loadPageData';
import { renderStaticPage, staticPageMetadata } from './staticRoutes';

export const revalidate = 60;

async function loadDbPage(slug: string) {
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const L = locale as Locale;

  const staticKey = keyForSlug(slug, L);
  if (staticKey) return staticPageMetadata(staticKey, L);

  const page = await loadDbPage(slug);
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

export default async function PublicPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;

  // 1) Static JSON page match (products, contact, r&d, solution).
  const staticKey = keyForSlug(slug, L);
  if (staticKey) {
    return renderStaticPage(staticKey, L);
  }

  // 2) Standalone DB page match.
  const page = await loadDbPage(slug);
  if (page) {
    const blocks = ((page.published_blocks as Record<Locale, Block[]> | null)?.[L] ?? []) as Block[];
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-16">
          {blocks.map((block) => (
            <RenderPreview key={block.id} block={block} />
          ))}
        </div>
      </main>
    );
  }

  // 3) Otherwise treat the slug as a collection basePath.
  const idx = await loadCollectionIndex(slug);
  if (!idx) notFound();

  const common = loadCommon(L);
  const { col, templatePage } = idx;
  const basePath = col.basePath ?? col.slug;

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

  const [colFields, colEntries] = await Promise.all([
    db.select().from(fields).where(eq(fields.collectionId, col.id)).orderBy(fields.order),
    db
      .select()
      .from(entries)
      .where(and(eq(entries.collectionId, col.id), eq(entries.status, 'published')))
      .orderBy(desc(entries.createdAt)),
  ]);

  const titleField = colFields.find((f) => f.type === 'text');
  const imageField = colFields.find((f) => f.type === 'image');
  const subtitleField = colFields.find((f) => f.type === 'textarea' || f.type === 'rich-text');
  const itemLabel = colEntries.length === 1 ? common.site.itemSingular : common.site.itemPlural;

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-white w-full pt-16 pb-12 xl:pt-24">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
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

      <section className="max-w-[1400px] mx-auto px-6 lg:px-8 pb-24">
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
              const href = `/${L}/${basePath}/${entry.slug ?? entry.id}`;

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
