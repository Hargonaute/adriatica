import { db } from '@/lib/db';
import { pages, collections } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { type PageData } from '@/types';
import { migratePageData } from '@/lib/page-builder/json/migrate';
import PageEditorWrapper from './PageEditorWrapper';

export default async function PageEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const result = await db.select().from(pages).where(eq(pages.id, id));
  const page = result[0];

  if (!page) {
      notFound();
  }

  // Transform DB record to PageData
  const initialData: PageData = migratePageData({
      id: page.id,
      title: page.title,
      slug: page.slug,
      status: page.status as 'draft' | 'published',
      blocks: page.draft_blocks as any,
      meta: page.meta as any,
      publishedAt: page.publishedAt?.toISOString(),
      updatedAt: page.updatedAt.toISOString(),
  });

  // Server Actions for persistence (or use API calls in client)
  // We'll pass API calling functions to the Client Component via props is weird serialization
  // Better to let Client Component use fetch() to our API routes we built.
  
  // Actually, we can just pass initialData and let the Editor use specific API endpoints
  // But Editor expects `onSave` etc.
  // We'll wrap the Editor with a Client Component that allows using fetch
  
  let isTemplate = page.isTemplate;
  let templateKind = (page.templateKind ?? null) as 'index' | 'detail' | null;
  let templateCollectionId = page.templateCollectionId ?? null;

  // If the page isn't yet wired as a template but is linked as a
  // detailTemplatePageId by a collection, synthesize the template context
  // so the page builder shows field bindings without a manual DB edit.
  if (!templateCollectionId) {
    const linked = await db
      .select({ id: collections.id })
      .from(collections)
      .where(eq(collections.detailTemplatePageId, page.id))
      .limit(1);
    if (linked.length) {
      isTemplate = true;
      templateKind = 'detail';
      templateCollectionId = linked[0].id;
    }
  }

  return (
    <PageEditorWrapper
      initialData={initialData}
      isTemplate={isTemplate}
      templateKind={templateKind}
      templateCollectionId={templateCollectionId}
    />
  );
}
