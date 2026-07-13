import type { Locale } from './config';
import { STATIC_PAGE_KEYS, type StaticPageKey } from './pageSlugs';

import homeData from '@/data/pages/home.json';
import productsData from '@/data/pages/products.json';
import contactData from '@/data/pages/contact.json';
import rdData from '@/data/pages/research-and-development.json';
import solutionData from '@/data/pages/find-a-solution.json';
import commonData from '@/data/common.json';

type BilingualBlob<T> = { fr: T; en: T };

type Registry = {
  home: BilingualBlob<(typeof homeData)['fr']>;
  products: BilingualBlob<(typeof productsData)['fr']>;
  contact: BilingualBlob<(typeof contactData)['fr']>;
  'research-and-development': BilingualBlob<(typeof rdData)['fr']>;
  solution: BilingualBlob<(typeof solutionData)['fr']>;
};

const staticPageRegistry: Registry = {
  home: homeData as Registry['home'],
  products: productsData as Registry['products'],
  contact: contactData as Registry['contact'],
  'research-and-development': rdData as Registry['research-and-development'],
  solution: solutionData as Registry['solution'],
};

export function loadHome(locale: Locale): Registry['home'][Locale] {
  return staticPageRegistry.home[locale];
}

export function loadProducts(locale: Locale): Registry['products'][Locale] {
  return staticPageRegistry.products[locale];
}

export function loadContact(locale: Locale): Registry['contact'][Locale] {
  return staticPageRegistry.contact[locale];
}

export function loadRD(locale: Locale): Registry['research-and-development'][Locale] {
  return staticPageRegistry['research-and-development'][locale];
}

export function loadSolution(locale: Locale): Registry['solution'][Locale] {
  return staticPageRegistry.solution[locale];
}

export function hasStaticPage(key: string): key is StaticPageKey {
  return (STATIC_PAGE_KEYS as string[]).includes(key);
}

export function loadCommon(locale: Locale) {
  return (commonData as BilingualBlob<(typeof commonData)['fr']>)[locale];
}

export type CommonData = ReturnType<typeof loadCommon>;
