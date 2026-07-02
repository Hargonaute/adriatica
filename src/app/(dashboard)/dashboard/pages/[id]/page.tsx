import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
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
  
  return (
    <PageEditorWrapper
      initialData={initialData}
      isTemplate={page.isTemplate}
      templateKind={page.templateKind ?? null}
      templateCollectionId={page.templateCollectionId ?? null}
    />
  );
}
