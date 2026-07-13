import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/config';
import type { StaticPageKey } from '@/lib/i18n/pageSlugs';
import {
  loadHome,
  loadProducts,
  loadContact,
  loadRD,
  loadSolution,
} from '@/lib/i18n/loadPageData';

import { ProduitsHero } from '@/components/produits/ProduitsHero';
import { ProduitsSection } from '@/components/home/ProduitsSection';
import { CatalogueSection } from '@/components/home/CatalogueSection';
import { ContactSection } from '@/components/home/ContactSection';
import { NewsletterCTA } from '@/components/shared/NewsletterCTA';

import { ContactInfoSection } from '@/components/contact/ContactInfoSection';

import { RDHero } from '@/components/recherche-et-developpement/RDHero';
import { SynergieSection } from '@/components/recherche-et-developpement/SynergieSection';
import { DurabiliteSection } from '@/components/recherche-et-developpement/DurabiliteSection';

import { TrouverHero } from '@/components/trouver-une-solution/TrouverHero';
import { TrouverFilter } from '@/components/trouver-une-solution/TrouverFilter';

export function staticPageMetadata(key: StaticPageKey, locale: Locale): Metadata {
  let meta;
  switch (key) {
    case 'products':
      meta = loadProducts(locale).meta;
      break;
    case 'contact':
      meta = loadContact(locale).meta;
      break;
    case 'research-and-development':
      meta = loadRD(locale).meta;
      break;
    case 'solution':
      meta = loadSolution(locale).meta;
      break;
  }
  return { title: meta.title, description: meta.description };
}

export function renderStaticPage(key: StaticPageKey, locale: Locale) {
  switch (key) {
    case 'products':
      return <ProductsPage locale={locale} />;
    case 'contact':
      return <ContactPage locale={locale} />;
    case 'research-and-development':
      return <RDPage locale={locale} />;
    case 'solution':
      return <SolutionPage locale={locale} />;
  }
}

function ProductsPage({ locale }: { locale: Locale }) {
  const data = loadProducts(locale);
  const home = loadHome(locale);
  return (
    <div className="min-h-screen bg-white">
      <ProduitsHero
        heading={data.hero.heading}
        paragraphs={data.hero.paragraphs}
        ctaLabel={data.hero.ctaLabel}
        ctaHref={data.hero.ctaHref}
        imageUrl={data.hero.imageUrl}
        imageAlt={data.hero.imageAlt}
      />
      <ProduitsSection
        heading={data.productsSection.heading}
        body={data.productsSection.body}
        items={data.productsSection.items}
      />
      <CatalogueSection
        heading={home.catalogue.heading}
        ctaLabel={home.catalogue.ctaLabel}
        imageUrl={home.catalogue.imageUrl}
        imageAlt={home.catalogue.imageAlt}
      />
      <ContactSection
        heading={home.contact.heading}
        body={home.contact.body}
        imageUrl={home.contact.imageUrl}
        imageAlt={home.contact.imageAlt}
        locale={locale}
      />
      <NewsletterCTA locale={locale} />
    </div>
  );
}

function ContactPage({ locale }: { locale: Locale }) {
  const data = loadContact(locale);
  const home = loadHome(locale);
  return (
    <div className="min-h-screen bg-white">
      <ContactInfoSection
        heading={data.info.heading}
        subheading={data.info.subheading}
        cards={data.info.cards.map((c) => ({
          icon: c.icon as 'message' | 'map' | 'phone',
          heading: c.heading,
          body: 'body' in c ? c.body : undefined,
          contact: 'contact' in c ? c.contact : undefined,
          contactHref: 'contactHref' in c ? c.contactHref : undefined,
          address: 'address' in c ? c.address : undefined,
        }))}
      />
      <ContactSection
        heading={home.contact.heading}
        body={home.contact.body}
        imageUrl="/home_page_img/Adriatica Web.jpg"
        imageAlt={home.contact.imageAlt}
        locale={locale}
      />
    </div>
  );
}

function RDPage({ locale }: { locale: Locale }) {
  const data = loadRD(locale);
  const home = loadHome(locale);
  return (
    <div className="min-h-screen bg-white">
      <RDHero
        heading={data.hero.heading}
        subheading={data.hero.subheading}
        ctaLabel={data.hero.ctaLabel}
        ctaHref={data.hero.ctaHref}
        imageUrl={data.hero.imageUrl}
        imageAlt={data.hero.imageAlt}
      />
      <SynergieSection
        heading={data.synergie.heading}
        paragraphs={data.synergie.paragraphs}
        imageUrl={data.synergie.imageUrl}
        imageAlt={data.synergie.imageAlt}
        imageCaption={data.synergie.imageCaption}
      />
      <DurabiliteSection sections={data.durabilite.sections} />
      <ContactSection
        heading={home.contact.heading}
        body={home.contact.body}
        imageUrl={home.contact.imageUrl}
        imageAlt={home.contact.imageAlt}
        locale={locale}
      />
    </div>
  );
}

function SolutionPage({ locale }: { locale: Locale }) {
  const data = loadSolution(locale);
  return (
    <div className="min-h-screen bg-white">
      <TrouverHero heading={data.hero.heading} subheading={data.hero.subheading} />
      <TrouverFilter labels={data.filter} locale={locale} />
      <NewsletterCTA locale={locale} />
    </div>
  );
}
