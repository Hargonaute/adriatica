/**
 * schema.org JSON-LD builders (pure, unit-testable).
 *
 * Organization values come from what the codebase already shows publicly
 * (contact page: email, phone, Casablanca HQ; logo in /public). Anything the
 * client still has to supply is a TODO-CLIENT constant left EMPTY: empty values
 * are never emitted, so nothing invented ends up in the markup.
 */

import { absoluteUrl, SITE_URL } from '../site';

export const ORGANIZATION = {
  name: 'Maghreb Adriatica',
  logoPath: '/images%20Adriatica/logo.png',
  // From src/data/pages/contact.json (contact cards).
  email: 'maghreb@k-adriatica.ma',
  telephone: '+212522674723',
  addressLocality: 'Casablanca',
  addressCountry: 'MA',
  // TODO-CLIENT: exact street address (contact.json reads "LIè des Cactus
  // n.18-3ème étage n.6 Sidi Bernoussi", which looks garbled) and postal code.
  streetAddress: '',
  postalCode: '',
  // TODO-CLIENT: real profile URLs (the footer links are still "#").
  sameAs: {
    linkedin: '',
    facebook: '',
    instagram: '',
  },
} as const;

/** Brand used on Product. TODO-CLIENT: confirm (some products may carry a supplier brand). */
export const PRODUCT_BRAND = 'Adriatica';

type Json = Record<string, unknown>;

function compact<T extends Json>(obj: T): T {
  const out: Json = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    if (Array.isArray(v) && v.length === 0) return;
    out[k] = v;
  });
  return out as T;
}

export function organizationJsonLd(): Json {
  const o = ORGANIZATION;
  const sameAs = Object.values(o.sameAs).filter((u) => /^https?:\/\//.test(u));
  return compact({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: o.name,
    url: `${SITE_URL}/`,
    logo: absoluteUrl(o.logoPath),
    email: o.email,
    address: compact({
      '@type': 'PostalAddress',
      streetAddress: o.streetAddress,
      postalCode: o.postalCode,
      addressLocality: o.addressLocality,
      addressCountry: o.addressCountry,
    }),
    contactPoint: [
      compact({
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: o.telephone,
        email: o.email,
        availableLanguage: ['French', 'English'],
      }),
    ],
    sameAs,
  });
}

export interface ProductJsonLdInput {
  name: string;
  url: string;
  image?: string | null;
  description?: string | null;
  category?: string | null;
}

/** Product without offers (no price data exists; none is invented). */
export function productJsonLd(p: ProductJsonLdInput): Json {
  return compact({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    url: p.url,
    image: p.image ? absoluteUrl(p.image) : undefined,
    description: p.description ?? undefined,
    brand: { '@type': 'Brand', name: PRODUCT_BRAND },
    category: p.category ?? undefined,
  });
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}
