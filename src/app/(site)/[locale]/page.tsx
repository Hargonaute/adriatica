import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HeroSection } from '@/components/home/HeroSection';
import { TrustedBySection } from '@/components/home/TrustedBySection';
import { EntrepriseSection } from '@/components/home/EntrepriseSection';
import { ProduitsSection } from '@/components/home/ProduitsSection';
import { RDSection } from '@/components/home/RDSection';
import { CatalogueSection } from '@/components/home/CatalogueSection';
import { ContactSection } from '@/components/home/ContactSection';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { loadHome, loadCommon, loadProducts } from '@/lib/i18n/loadPageData';
import { pathForKey } from '@/lib/i18n/pageSlugs';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const data = loadHome(locale as Locale);
  return {
    title: data.meta.title,
    description: data.meta.description,
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;
  const data = loadHome(L);
  const common = loadCommon(L);
  const products = loadProducts(L).productsSection;

  const heroPrimaryHref =
    data.hero.primaryCtaKey === 'contact' || data.hero.primaryCtaKey === 'solution'
      ? pathForKey(data.hero.primaryCtaKey, L)
      : '#contact';
  const heroSecondaryHref =
    data.hero.secondaryCtaKey === 'contact' || data.hero.secondaryCtaKey === 'solution'
      ? pathForKey(data.hero.secondaryCtaKey, L)
      : '#search';

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-red-100 selection:text-red-900">
      <HeroSection
        headline={data.hero.headline}
        subheadline={data.hero.subheadline}
        primaryCtaLabel={data.hero.primaryCtaLabel}
        primaryCtaUrl={heroPrimaryHref}
        secondaryCtaLabel={data.hero.secondaryCtaLabel}
        secondaryCtaUrl={heroSecondaryHref}
        imageUrl={data.hero.imageUrl}
        imageAlt={data.hero.imageAlt}
        productSearchLocale={L}
      />
      <TrustedBySection tagline={common.trustedBy.tagline} />
      <EntrepriseSection
        heading={data.entreprise.heading}
        ctaLabel={data.entreprise.ctaLabel}
        ctaHref={data.entreprise.ctaHref}
        paragraphs={data.entreprise.paragraphs}
        imageUrl={data.entreprise.imageUrl}
        imageAlt={data.entreprise.imageAlt}
      />
      <ProduitsSection
        heading={data.products.heading}
        body={data.products.body}
        items={products.items}
      />
      <RDSection
        heading={data.rd.heading}
        body={data.rd.body}
        ctaLabel={data.rd.ctaLabel}
        ctaHref={data.rd.ctaHref}
        imageUrl={data.rd.imageUrl}
        imageAlt={data.rd.imageAlt}
      />
      <CatalogueSection
        heading={data.catalogue.heading}
        ctaLabel={data.catalogue.ctaLabel}
        imageUrl={data.catalogue.imageUrl}
        imageAlt={data.catalogue.imageAlt}
      />
      <ContactSection
        heading={data.contact.heading}
        body={data.contact.body}
        imageUrl={data.contact.imageUrl}
        imageAlt={data.contact.imageAlt}
        locale={L}
      />
    </div>
  );
}
