import { notFound } from 'next/navigation';
import { db, collections, fields, entries, pages } from '@/lib/db';
import { eq, and, or } from 'drizzle-orm';
import Link from 'next/link';
import type { Metadata } from 'next';
import { type Block } from '@/types';
import { TemplateRenderer } from './TemplateRenderer';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string; itemId: string }>;
}

async function getData(slug: string, itemId: string) {
  // Fetch collection by slug
  const [col] = await db
    .select()
    .from(collections)
    .where(eq(collections.slug, slug))
    .limit(1);

  if (!col) return null;

  // Fetch fields + entry in parallel
  const [colFields, [entry]] = await Promise.all([
    db.select().from(fields).where(eq(fields.collectionId, col.id)).orderBy(fields.order),
    db.select().from(entries).where(
      and(
        eq(entries.collectionId, col.id),
        eq(entries.status, 'published'),
        or(eq(entries.slug, itemId), eq(entries.id, itemId))
      )
    ).limit(1),
  ]);

  if (!entry) return null;

  return { col, fields: colFields, entry };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, itemId } = await params;
  const data = await getData(slug, itemId);
  if (!data) return {};

  // Use the first text field as a title hint
  const titleField = data.fields.find(f => f.type === 'text');
  const title = titleField ? String((data.entry.data as Record<string, any>)[titleField.key] ?? '') : '';

  return {
    title: title || data.col.name,
  };
}

export default async function CollectionItemPage({ params }: Props) {
  const { slug, itemId } = await params;
  const data = await getData(slug, itemId);
  if (!data) notFound();

  const { col, fields: colFields, entry } = data;
  const itemData = entry.data as Record<string, any>;

  // --- Template routing ---
  if (col.detailTemplatePageId) {
    const [templatePage] = await db
      .select()
      .from(pages)
      .where(and(eq(pages.id, col.detailTemplatePageId), eq(pages.status, 'published')))
      .limit(1);

    if (templatePage) {
      const blocks = ((templatePage.published_blocks as any)?.en ?? []) as Block[];
      return (
        <TemplateRenderer
          blocks={blocks}
          ctx={{ itemId, collectionSlug: slug }}
        />
      );
    }
  }

  // --- Auto-template (default behaviour) ---
  const titleField = colFields.find(f => f.type === 'text');
  const pageTitle = titleField ? String(itemData[titleField.key] ?? '') : col.name;
  const heroImageField = colFields.find(f => f.type === 'image');
  const heroImage = heroImageField ? String(itemData[heroImageField.key] ?? '') : null;

  return (
    <main className="min-h-screen bg-white">
      {/* Hero image */}
      {heroImage && (
        <div className="w-full h-[50vh] max-h-[520px] relative overflow-hidden bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt={pageTitle}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="max-w-[860px] mx-auto px-6 lg:px-8 py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-[#BC0D2A] transition-colors">Home</Link>
          <span>/</span>
          <Link href={`/collections/${slug}`} className="hover:text-[#BC0D2A] transition-colors capitalize">
            {col.name}
          </Link>
          <span>/</span>
          <span className="text-slate-900 truncate max-w-[200px]">{pageTitle}</span>
        </nav>

        {/* Title */}
        <h1 className="font-[family-name:var(--font-inter)] text-4xl sm:text-5xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-10">
          {pageTitle}
        </h1>

        {/* Fields */}
        <div className="space-y-8">
          {colFields.map(field => {
            const val = itemData[field.key];

            // Skip empty values and the title field (already shown as heading)
            if (val === undefined || val === null || val === '') return null;
            if (field.id === titleField?.id) return null;

            return (
              <div key={field.id}>
                {/* Label */}
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                  {field.label}
                </p>

                {/* Value — type-specific rendering */}
                {field.type === 'image' && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={String(val)}
                    alt={field.label}
                    className="w-full max-h-[480px] object-cover rounded-2xl"
                  />
                )}

                {field.type === 'rich-text' && (
                  <div
                    className={
                      'prose prose-slate max-w-none ' +
                      'prose-headings:font-[family-name:var(--font-inter)] prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-[#0f172a] ' +
                      'prose-p:text-[#64748b] prose-p:text-[17px] prose-p:leading-relaxed ' +
                      'prose-a:text-[#BC0D2A] prose-a:no-underline hover:prose-a:underline ' +
                      'prose-strong:text-[#0f172a] prose-ul:list-disc prose-ol:list-decimal prose-li:text-[#64748b]'
                    }
                    dangerouslySetInnerHTML={{ __html: String(val) }}
                  />
                )}

                {field.type === 'textarea' && (
                  <p className="text-[17px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {String(val)}
                  </p>
                )}

                {field.type === 'checkbox' && (
                  <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${val ? 'text-green-700' : 'text-slate-500'}`}>
                    {val ? '✓ Yes' : '✗ No'}
                  </span>
                )}

                {(field.type === 'email') && (
                  <a
                    href={`mailto:${String(val)}`}
                    className="text-[#BC0D2A] font-medium hover:underline"
                  >
                    {String(val)}
                  </a>
                )}

                {(field.type === 'text' || field.type === 'number' || field.type === 'date') && (
                  <p className="text-[17px] text-slate-600">{String(val)}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Back link */}
        <div className="mt-16 pt-8 border-t">
          <Link
            href={`/collections/${slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#BC0D2A] hover:underline"
          >
            ← Back to {col.name}
          </Link>
        </div>
      </div>
    </main>
  );
}
