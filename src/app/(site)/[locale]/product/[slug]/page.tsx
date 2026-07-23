import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { RenderPreview } from '@/components/page-builder/renderPreview';
import { type Block } from '@/types';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { loadHome } from '@/lib/i18n/loadPageData';
import { CatalogueSection } from '@/components/home/CatalogueSection';
import { ContactSection } from '@/components/home/ContactSection';

// The catalogue and contact-form sections are fixed on every product page —
// rendered from the real home components (like the navbar/footer), not as
// page-builder blocks. Any such blocks left in a page's saved data are dropped
// here so they don't render twice.
const FIXED_SECTION_BLOCK_TYPES = new Set(['catalogue', 'contact-form-simple']);

export const revalidate = 60;

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

async function loadProductPage(slug: string) {
  const [page] = await db
    .select()
    .from(pages)
    .where(
      and(
        eq(pages.slug, `produit-${slug}`),
        eq(pages.status, 'published'),
        eq(pages.isTemplate, false)
      )
    )
    .limit(1);
  return page ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await loadProductPage(slug);
  if (!page) return {};
  const meta = (page.meta ?? {}) as Record<string, string> & {
    ogImage?: string;
    noIndex?: boolean;
  };
  return {
    title: meta.title || page.title,
    description: meta.description,
    openGraph: { images: meta.ogImage ? [meta.ogImage] : [] },
    robots: meta.noIndex ? { index: false } : undefined,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;

  const page = await loadProductPage(slug);
  if (!page) notFound();

  const blocks = (
    (page.published_blocks as Record<Locale, Block[]> | null)?.[L] ?? []
  ) as Block[];
  const contentBlocks = blocks.filter((b) => !FIXED_SECTION_BLOCK_TYPES.has(b.type));

  const home = loadHome(L);

  return (
    <main className="min-h-screen bg-white overflow-x-clip">
      {contentBlocks.map((block) => (
        <RenderPreview key={block.id} block={block} />
      ))}

      <CatalogueSection
        heading={home.catalogue.heading}
        ctaLabel={home.catalogue.ctaLabel}
        imageUrl={home.catalogue.imageUrl}
        imageAlt={home.catalogue.imageAlt}
      />
      <ContactSection
        heading={home.contact.heading}
        body={home.contact.body}
        imageUrl="/home_page_img/Adriatica Web.jpg"
        imageAlt={home.contact.imageAlt}
        locale={L}
      />
    </main>
  );
}
