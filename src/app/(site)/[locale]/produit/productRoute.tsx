import { cache } from 'react';
import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import { RenderPreview } from '@/components/page-builder/renderPreview';
import { type Block } from '@/types';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { pathForKey } from '@/lib/i18n/pageSlugs';
import { loadCommon, loadHome } from '@/lib/i18n/loadPageData';
import { CatalogueSection } from '@/components/home/CatalogueSection';
import { ContactSection } from '@/components/home/ContactSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { heroFromBlocks, publicProductFacets } from '@/lib/products/productMeta';
import { PRODUCT_SEGMENT, pageSlugForProduct, productPath } from '@/lib/products/productUrl';
import { termForLabel, termLabel } from '@/lib/products/catalogueSlugs';
import { catalogueHref } from '@/lib/i18n/solutionHref';
import { buildPageMetadata, hasBlocks, resolvePageMeta } from '@/lib/seo/metadata';
import { breadcrumbJsonLd, productJsonLd } from '@/lib/seo/jsonLd';
import { absoluteUrl } from '@/lib/site';
import { brandTitle } from '@/lib/seo/brandTitle';

// Single implementation of the product detail page, served at
// /fr/produit/<slug> and /en/product/<slug> (full-bleed layout). The two route
// files (produit/[slug], product/[slug]) only bind their URL segment; a request
// on the other locale's segment 308s to the canonical URL (the proxy normally
// does that before the page is reached).

// The catalogue and contact-form sections are fixed on every product page —
// rendered from the real home components (like the navbar/footer), not as
// page-builder blocks. Any such blocks left in a page's saved data are dropped
// here so they don't render twice.
const FIXED_SECTION_BLOCK_TYPES = new Set(['catalogue', 'contact-form-simple']);

export interface ProductRouteProps {
  params: Promise<{ locale: string; slug: string }>;
}

const loadProductPage = cache(async (slug: string) => {
  const [page] = await db
    .select()
    .from(pages)
    .where(
      and(
        eq(pages.slug, pageSlugForProduct(slug)),
        eq(pages.status, 'published'),
        eq(pages.isTemplate, false)
      )
    )
    .limit(1);
  return page ?? null;
});

function blocksFor(page: { published_blocks: unknown }, locale: Locale): Block[] {
  return ((page.published_blocks as Record<Locale, Block[]> | null)?.[locale] ?? []) as Block[];
}

function localizedMeta(page: { meta: unknown; title: string; published_blocks: unknown }, locale: Locale) {
  const enHeroTitle = heroFromBlocks(blocksFor(page, 'en')).title;
  return resolvePageMeta(page.meta, locale, page.title, enHeroTitle);
}

export async function productGenerateMetadata({ params }: ProductRouteProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const page = await loadProductPage(slug);
  if (!page) return {};

  const meta = (page.meta ?? {}) as { ogImage?: unknown; noIndex?: unknown };
  const { title, description } = localizedMeta(page, locale);
  const ogImage =
    (typeof meta.ogImage === 'string' && meta.ogImage.trim()) ||
    heroFromBlocks(blocksFor(page, 'fr')).image ||
    null;

  return buildPageMetadata({
    locale,
    selfPath: productPath(locale, slug),
    paths: {
      fr: hasBlocks(page.published_blocks, 'fr') ? productPath('fr', slug) : undefined,
      en: hasBlocks(page.published_blocks, 'en') ? productPath('en', slug) : undefined,
    },
    title: brandTitle(title),
    description,
    image: ogImage,
    noIndex: meta.noIndex === true,
  });
}

export async function ProductRoutePage({
  params,
  segment,
}: ProductRouteProps & { segment: string }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;
  if (segment !== PRODUCT_SEGMENT[L]) permanentRedirect(productPath(L, slug));

  const page = await loadProductPage(slug);
  if (!page) notFound();

  const blocks = blocksFor(page, L);
  const contentBlocks = blocks.filter((b) => !FIXED_SECTION_BLOCK_TYPES.has(b.type));

  const home = loadHome(L);
  const common = loadCommon(L);

  // ── Structured data ────────────────────────────────────────────────────────
  const { title, description } = localizedMeta(page, L);
  const heroName = heroFromBlocks(blocks).title;
  const name = heroName || title || page.title;
  const url = absoluteUrl(productPath(L, slug));
  // Famille from the frozen slug map (B6), with the B8 NPK bridge; it links to
  // the filtered catalogue (/fr/trouver-une-solution?famille=<slug>).
  const famille = publicProductFacets(page.meta)?.famille ?? null;
  const familleTerm = famille ? termForLabel('famille', famille) : null;
  const crumbs = [
    { name: common.site.homeCrumb, url: `/${L}` },
    { name: L === 'fr' ? 'Produits' : 'Products', url: pathForKey('products', L) },
    ...(familleTerm
      ? [{ name: termLabel(familleTerm, L), url: catalogueHref(L, { famille: familleTerm.slug }) }]
      : []),
    { name, url },
  ];

  return (
    <main className="min-h-screen bg-white overflow-x-clip">
      <JsonLd
        data={[
          productJsonLd({
            name,
            url,
            image: heroFromBlocks(blocksFor(page, 'fr')).image || null,
            description,
            category: familleTerm ? termLabel(familleTerm, L) : famille,
          }),
          breadcrumbJsonLd(crumbs),
        ]}
      />
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
