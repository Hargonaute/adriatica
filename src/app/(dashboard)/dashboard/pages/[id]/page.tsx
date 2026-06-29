import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import PageBuilderEditor from '@/components/page-builder/Editor';
import { type PageData } from '@/types';
import { migratePageData } from '@/lib/page-builder/json/migrate';
import PageEditorWrapper from './PageEditorWrapper';

export default async function PageEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Handle "new" creation separately or check ID
  if (id === 'new') {
      // Create a default page and redirect to it
      const [newPage] = await db.insert(pages).values({
          title: 'Untitled Page',
          slug: `page-${Date.now()}`,
          draft_blocks: { en: [], ar: [] },
      }).returning();
      
      redirect(`/dashboard/pages/${newPage.id}`);
  }
  
  console.log('[Debug] PageEditorPage params.id:', id);

  const result = await db.select().from(pages).where(eq(pages.id, id));
  const page = result[0];
  
  console.log('[Debug] Page found?', !!page);

  if (!page) {
      console.log('[Debug] Page not found, returning 404');
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
  
  return <PageEditorWrapper initialData={initialData} isTemplate={page.isTemplate} templateCollectionId={page.templateCollectionId ?? null} />;
}
