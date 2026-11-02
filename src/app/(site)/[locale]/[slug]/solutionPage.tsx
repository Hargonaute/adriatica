import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import type { Locale } from '@/lib/i18n/config';
import { pathForKey } from '@/lib/i18n/pageSlugs';
import { loadSolution } from '@/lib/i18n/loadPageData';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { brandTitle } from '@/lib/seo/brandTitle';
import {
  catalogueSeo,
  normalizeCatalogueParams,
  type RawSearchParams,
} from '@/lib/products/catalogueFilter';
import { termLabel } from '@/lib/products/catalogueSlugs';
import { catalogueCards, catalogueOptions } from '@/lib/products/catalogueView';
import { loadProductFilterItems } from '@/lib/products/loadProductFilterItems';
import { introFor, introParagraphs, type CatalogueIntros } from '@/lib/products/catalogueIntros';
import { getCatalogueIntros } from '@/lib/products/catalogueIntrosStore';
import type { ProductFilterItem } from '@/lib/products/productMeta';
import { TrouverHero } from '@/components/trouver-une-solution/TrouverHero';
import { TrouverFilter } from '@/components/trouver-une-solution/TrouverFilter';
import { NewsletterCTA } from '@/components/shared/NewsletterCTA';

// "Trouver une solution" (/fr/trouver-une-solution, /en/find-a-solution):
// server-rendered, filtered from ?famille= / ?culture= / ?probleme= (Lot B).
// Non-canonical queries (unknown params or slugs, wrong order, repeated
// params, ?probleme=npk-hydrosolubles) 308 to the canonical URL.

function intro(intros: CatalogueIntros, facet: string, slug: string, locale: Locale): string {
  return facet === 'famille' || facet === 'culture' ? introFor(intros, facet, slug, locale) : '';
}

/** First sentence-ish chunk of an intro, for the meta description. */
function descriptionFrom(text: string): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length <= 160 ? flat : `${flat.slice(0, 157).replace(/\s+\S*$/, '')}…`;
}

export async function solutionPageMetadata(locale: Locale, searchParams: RawSearchParams): Promise<Metadata> {
  const data = loadSolution(locale);
  const { filters } = normalizeCatalogueParams(searchParams);
  const seo = catalogueSeo(filters);
  const paths = { fr: pathForKey('solution', 'fr'), en: pathForKey('solution', 'en') };

  let title: string = data.meta.title;
  let description: string = data.meta.description;
  if (seo.single) {
    const label = termLabel(seo.single.term, locale);
    title = `${label} — ${data.hero.heading}`;
    const text = intro(await getCatalogueIntros(), seo.single.facet, seo.single.term.slug, locale);
    if (text) description = descriptionFrom(text);
  }

  return buildPageMetadata({
    locale,
    paths,
    query: seo.canonicalQuery,
    title: brandTitle(title),
    description,
    noIndex: !seo.index,
  });
}

export async function SolutionPage({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams: RawSearchParams;
}) {
  const basePath = pathForKey('solution', locale);
  const { filters, query, changed } = normalizeCatalogueParams(searchParams);
  if (changed) permanentRedirect(query ? `${basePath}?${query}` : basePath);

  const data = loadSolution(locale);
  const seo = catalogueSeo(filters);

  let items: ProductFilterItem[] = [];
  try {
    items = await loadProductFilterItems();
  } catch (error) {
    // The page still renders (empty state) if the DB is unreachable.
    console.error('find-a-solution: failed to load products', error);
  }
  const intros = seo.single ? await getCatalogueIntros() : null;

  const heading = seo.single ? termLabel(seo.single.term, locale) : data.hero.heading;
  const paragraphs =
    seo.single && intros
      ? introParagraphs(intro(intros, seo.single.facet, seo.single.term.slug, locale))
      : [];

  return (
    <div className="min-h-screen bg-white">
      <TrouverHero heading={heading} subheading={data.hero.subheading} intro={paragraphs} />
      <TrouverFilter
        labels={data.filter}
        basePath={basePath}
        contactHref={pathForKey('contact', locale)}
        items={catalogueCards(items, locale)}
        options={catalogueOptions(items, locale, filters)}
        initialFilters={filters}
      />
      <NewsletterCTA locale={locale} />
    </div>
  );
}
