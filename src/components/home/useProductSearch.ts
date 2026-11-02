'use client';

import { useMemo, useState } from 'react';
import type { Locale } from '@/lib/i18n/config';
import type { ProductFilterItem } from '@/lib/products/productMeta';

type SearchableProduct = ProductFilterItem & { pathSlug: string };

/**
 * Site search over the same source as "Trouver une solution" (/api/products:
 * published product pages only), so a result never links to an unpublished
 * page or to the legacy collection detail view.
 */
export function useProductSearch(locale: Locale, search: string) {
  const [products, setProducts] = useState<SearchableProduct[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const ensureLoaded = async () => {
    if (loaded || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (!res.ok) return;
      const data = (await res.json()) as ProductFilterItem[];
      setProducts(data.filter((p): p is SearchableProduct => !!p.pathSlug));
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [] as SearchableProduct[];
    return products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 8);
  }, [products, search]);

  // Same link as the "Trouver une solution" cards.
  const hrefFor = (product: SearchableProduct) => `/${locale}/${product.pathSlug}`;

  return { ensureLoaded, loaded, loading, filtered, hrefFor };
}
