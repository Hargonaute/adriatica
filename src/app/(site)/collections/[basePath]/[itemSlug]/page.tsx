import { notFound } from 'next/navigation';
import { db, collections, entries, pages, fields } from '@/lib/db';
import { and, eq, or, isNull } from 'drizzle-orm';
import Link from 'next/link';
import type { Metadata } from 'next';
import { type Block } from '@/types';
import { TemplateRenderer } from './TemplateRenderer';

export const revalidate = 60;

interface Props {
  params: Promise<{ basePath: string; itemSlug: string }>;
}

async function resolveCollection(basePath: string) {
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
  return col ?? null;
}

// entries.id is a UUID column — comparing it against a non-UUID string throws
// a Postgres type-cast error, so only include the id fallback when the segment
// actually looks like a UUID (keeps legacy /collections/[slug]/[uuid] links
// working without breaking slug lookups like "n-gooo-26").
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getData(basePath: string, itemSlug: string) {
  const col = await resolveCollection(basePath);
  if (!col) return null;

  const identityMatch = UUID_RE.test(itemSlug)
    ? or(eq(entries.slug, itemSlug), eq(entries.id, itemSlug))
    : eq(entries.slug, itemSlug);

  const [entry] = await db
    .select()
    .from(entries)
    .where(
      and(
        eq(entries.collectionId, col.id),
        eq(entries.status, 'published'),
        identityMatch
      )
    )
    .limit(1);

  if (!entry) return null;

  const [templatePage, colFields] = await Promise.all([
    col.detailTemplatePageId
      ? db
          .select()
          .from(pages)
          .where(and(eq(pages.id, col.detailTemplatePageId), eq(pages.status, 'published')))
          .limit(1)
          .then(rows => rows[0] ?? null)
      : Promise.resolve(null),
    db.select().from(fields).where(eq(fields.collectionId, col.id)).orderBy(fields.order),
  ]);

  return { col, entry, templatePage, colFields };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { basePath, itemSlug } = await params;
  const data = await getData(basePath, itemSlug);
  if (!data) return {};

  const entryData = data.entry.data as Record<string, unknown>;
  const entryTitle =
    typeof entryData.name === 'string' ? entryData.name :
    typeof entryData.title === 'string' ? entryData.title : '';

  const meta = (data.templatePage?.meta ?? {}) as Record<string, string>;

  return {
    title: entryTitle || meta.title || data.col.name,
    description: meta.description,
  };
}

export default async function CollectionItemDetailPage({ params }: Props) {
  const { basePath, itemSlug } = await params;
  const data = await getData(basePath, itemSlug);
  if (!data) notFound();

  const { col, entry, templatePage, colFields } = data;

  // Prefer the published detail template. If one exists, render it wrapped in
  // CollectionItemContext so bound blocks resolve field values synchronously.
  if (templatePage) {
    const blocks = ((templatePage.published_blocks as Record<string, Block[]> | null)?.en ?? []) as Block[];
    return (
      <TemplateRenderer
        blocks={blocks}
        ctx={{
          itemId: entry.id,
          collectionSlug: col.basePath ?? col.slug,
          entry: {
            id: entry.id,
            slug: entry.slug,
            collectionId: entry.collectionId,
            data: (entry.data ?? {}) as Record<string, unknown>,
          },
          collection: {
            id: col.id,
            name: col.name,
            slug: col.slug,
            fields: colFields.map(f => ({
              id: f.id,
              key: f.key,
              label: f.label,
              type: f.type,
              required: f.required ?? false,
              order: f.order ?? 0,
            })),
          },
        }}
      />
    );
  }

  // Fallback: no published detail template — render a bare-bones field dump.
  const itemData = entry.data as Record<string, unknown>;
  const titleField = colFields.find(f => f.type === 'text');
  const pageTitle = titleField ? String(itemData[titleField.key] ?? '') : col.name;
  const heroImageField = colFields.find(f => f.type === 'image');
  const heroImage = heroImageField ? String(itemData[heroImageField.key] ?? '') : null;
  const indexHref = `/collections/${col.basePath ?? col.slug}`;

  return (
    <main className="min-h-screen bg-white">
      {heroImage && (
        <div className="w-full h-[50vh] max-h-[520px] relative overflow-hidden bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroImage} alt={pageTitle} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="max-w-[860px] mx-auto px-6 lg:px-8 py-16">
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-[#BC0D2A] transition-colors">Home</Link>
          <span>/</span>
          <Link href={indexHref} className="hover:text-[#BC0D2A] transition-colors capitalize">
            {col.name}
          </Link>
          <span>/</span>
          <span className="text-slate-900 truncate max-w-[200px]">{pageTitle}</span>
        </nav>

        <h1 className="font-[family-name:var(--font-inter)] text-4xl sm:text-5xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-10">
          {pageTitle}
        </h1>

        <div className="space-y-8">
          {colFields.map(field => {
            const val = itemData[field.key];
            if (val === undefined || val === null || val === '') return null;
            if (field.id === titleField?.id) return null;

            return (
              <div key={field.id}>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                  {field.label}
                </p>

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

                {field.type === 'email' && (
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

        <div className="mt-16 pt-8 border-t">
          <Link
            href={indexHref}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#BC0D2A] hover:underline"
          >
            ← Back to {col.name}
          </Link>
        </div>
      </div>
    </main>
  );
}
