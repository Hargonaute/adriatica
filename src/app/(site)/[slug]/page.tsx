import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { RenderPreview } from '@/components/page-builder/renderPreview';
import { type Block } from '@/types';
import { Metadata } from 'next';

// Revalidate every minute or use on-demand revalidation in the publish API
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await db.select().from(pages).where(
    and(eq(pages.slug, slug), eq(pages.status, 'published'))
  );
  const page = result[0];

  if (!page) return {};

  const meta = page.meta as any;

  return {
    title: meta?.title || page.title,
    description: meta?.description,
    openGraph: {
        images: meta?.ogImage ? [meta.ogImage] : [],
    },
    // Prevent indexing if noIndex is true
    robots: meta?.noIndex ? { index: false } : undefined,
  };
}

export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await db.select().from(pages).where(
    and(eq(pages.slug, slug), eq(pages.status, 'published'))
  );
  const page = result[0];

  if (!page) {
    notFound();
  }

  const blocks = (page.published_blocks as any)?.en as Block[] || [];

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
