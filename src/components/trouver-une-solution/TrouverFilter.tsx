'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown, Undo2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { foldKey } from '@/lib/products/foldKey';
import type { CatalogueFacet } from '@/lib/products/catalogueSlugs';
import {
  catalogueQuery,
  matchesCatalogueFilters,
  type CatalogueFilters,
  type FacetSlugs,
} from '@/lib/products/catalogueFilter';

export interface TrouverFilterLabels {
  criteresHeading: string;
  criteresSubtitle: string;
  searchPlaceholder: string;
  cultureLabel: string;
  culturePlaceholder: string;
  problematiqueLabel: string;
  problematiquePlaceholder: string;
  familleLabel: string;
  famillePlaceholder: string;
  resetLabel: string;
  recommendationHeading: string;
  productSingular: string;
  productPlural: string;
  loadingText: string;
  emptyText: string;
  emptyContactText: string;
  emptyContactCta: string;
  allOption: string;
  noOptions: string;
  untitled: string;
}

/** One product card, already resolved for the page locale on the server. */
export interface TrouverItem {
  id: string;
  name: string;
  /** Canonical product URL (publicPathForPage); null → card without link. */
  href: string | null;
  image: string | null;
  facetSlugs: FacetSlugs;
  /** Folded text the search box matches against (name + facet labels). */
  searchText: string;
}

export interface FacetOption {
  slug: string;
  label: string;
}

export interface TrouverFilterProps {
  labels: TrouverFilterLabels;
  /** Path of the page without query (pathForKey('solution', locale)). */
  basePath: string;
  /** Contact page path for the empty state. */
  contactHref: string;
  items: TrouverItem[];
  options: Record<CatalogueFacet, FacetOption[]>;
  /** Filters from the (already canonical) URL. */
  initialFilters: CatalogueFilters;
}

const PLACEHOLDER_IMAGE = '/produit_page_img/Adriatica Web Featured Icon.png';

// next/image only optimises local files and hosts allowed in next.config.ts;
// anything else (e.g. an external URL typed in a product-hero) is rendered
// unoptimised instead of throwing.
function isOptimizableImage(src: string): boolean {
  return src.startsWith('/') || /^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//.test(src);
}

function CustomSelect({
  placeholder,
  options,
  value,
  onChange,
  allOption,
  noOptions,
}: {
  placeholder: string;
  options: FacetOption[];
  value: string | null;
  onChange: (next: string | null) => void;
  allOption: string;
  noOptions: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find((o) => o.slug === value)?.label ?? null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full text-left" ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={selectedLabel ?? undefined}
        aria-expanded={isOpen}
        className="flex items-center justify-between gap-2 w-full h-11 px-3 bg-white border border-slate-200 rounded-lg text-sm transition-colors hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#BC0D2A]/20 focus:border-[#BC0D2A]"
      >
        <span
          className={`flex-1 min-w-0 truncate text-left ${
            selectedLabel ? 'text-slate-900' : 'text-slate-500'
          }`}
        >
          {selectedLabel || placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-lg shadow-lg overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200 max-h-64 overflow-y-auto">
          {value !== null && (
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 text-sm text-slate-500 italic hover:bg-slate-50"
            >
              {allOption}
            </button>
          )}
          {options.length === 0 ? (
            <div className="px-3 py-2.5 text-sm text-slate-400">{noOptions}</div>
          ) : (
            options.map((option) => (
              <button
                key={option.slug}
                type="button"
                onClick={() => {
                  onChange(option.slug);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                  value === option.slug
                    ? 'bg-[#BC0D2A]/10 text-[#BC0D2A] font-medium'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-[#BC0D2A]'
                }`}
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Filter + product grid of the "Trouver une solution" page. The server
 * renders it with the products and the filters from the URL (so the filtered
 * list is in the HTML); changing a filter updates the URL with router.replace
 * (canonical order famille, culture, probleme) — no reload, no client fetch.
 */
export function TrouverFilter({
  labels,
  basePath,
  contactHref,
  items,
  options,
  initialFilters,
}: TrouverFilterProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<CatalogueFilters>(initialFilters);
  const [search, setSearch] = useState('');

  // The URL is the source of truth: when the server re-renders with other
  // params (back / forward, a link), follow them.
  const initialQuery = catalogueQuery(initialFilters);
  useEffect(() => {
    setFilters(initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const applyFilters = (next: CatalogueFilters) => {
    setFilters(next);
    const q = catalogueQuery(next);
    router.replace(q ? `${basePath}?${q}` : basePath, { scroll: false });
  };

  const setFacet = (facet: CatalogueFacet) => (slug: string | null) => {
    const next: CatalogueFilters = { ...filters };
    if (slug) next[facet] = slug;
    else delete next[facet];
    applyFilters(next);
  };

  const filtered = useMemo(() => {
    const q = foldKey(search);
    return items.filter(
      (item) => matchesCatalogueFilters(item.facetSlugs, filters) && (!q || item.searchText.includes(q))
    );
  }, [items, filters, search]);

  const handleReset = () => {
    setSearch('');
    applyFilters({});
  };

  const resultLabel = filtered.length === 1 ? labels.productSingular : labels.productPlural;

  return (
    <section className="bg-white w-full pb-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full flex flex-col lg:flex-row border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm min-h-[700px]">
          <div className="w-full lg:w-[320px] shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 p-8 flex flex-col gap-8 bg-white z-10">
            <div>
              <h2 className="font-[family-name:var(--font-inter)] text-2xl font-bold text-[#BC0D2A] tracking-tight mb-2">
                {labels.criteresHeading}
              </h2>
              <p className="text-slate-500 text-[15px] leading-relaxed">{labels.criteresSubtitle}</p>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={labels.searchPlaceholder}
                aria-label={labels.searchPlaceholder}
                className="w-full h-11 pl-10 pr-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#BC0D2A]/20 focus:border-[#BC0D2A] transition-colors text-sm placeholder:text-slate-400 text-slate-900"
              />
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2 relative z-30">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {labels.cultureLabel}
                </label>
                <CustomSelect
                  placeholder={labels.culturePlaceholder}
                  options={options.culture}
                  value={filters.culture ?? null}
                  onChange={setFacet('culture')}
                  allOption={labels.allOption}
                  noOptions={labels.noOptions}
                />
              </div>

              <div className="flex flex-col gap-2 relative z-20">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {labels.familleLabel}
                </label>
                <CustomSelect
                  placeholder={labels.famillePlaceholder}
                  options={options.famille}
                  value={filters.famille ?? null}
                  onChange={setFacet('famille')}
                  allOption={labels.allOption}
                  noOptions={labels.noOptions}
                />
              </div>

              <div className="flex flex-col gap-2 relative z-10">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {labels.problematiqueLabel}
                </label>
                <CustomSelect
                  placeholder={labels.problematiquePlaceholder}
                  options={options.probleme}
                  value={filters.probleme ?? null}
                  onChange={setFacet('probleme')}
                  allOption={labels.allOption}
                  noOptions={labels.noOptions}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 p-8 lg:p-10 flex flex-col bg-[#fcfbfc] z-0">
            <div className="flex flex-col gap-4 mb-8">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 text-[#BC0D2A] text-[13px] font-semibold hover:underline w-fit"
              >
                <Undo2 size={14} strokeWidth={2.5} />
                {labels.resetLabel}
              </button>

              <div className="pb-4 border-b border-slate-200 flex items-baseline justify-between gap-4">
                <h3 className="font-[family-name:var(--font-inter)] text-xl font-bold text-slate-900 tracking-tight">
                  {labels.recommendationHeading}
                </h3>
                <span className="text-sm text-slate-500" aria-live="polite" data-testid="product-count">
                  {filtered.length} {resultLabel}
                </span>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center text-sm">
                <p className="text-slate-500">{labels.emptyText}</p>
                <p className="text-slate-400">{labels.emptyContactText}</p>
                <Link
                  href={contactHref}
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-[#BC0D2A] text-white font-semibold hover:bg-[#9A0B22] transition-colors"
                >
                  {labels.emptyContactCta}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((item) => {
                  const name = item.name;
                  const imageUrl = item.image || PLACEHOLDER_IMAGE;
                  const card = (
                    <>
                      <div className="relative w-full aspect-[4/5] max-w-[160px] mx-auto mb-6">
                        <Image
                          src={imageUrl}
                          alt={name}
                          fill
                          sizes="160px"
                          className="object-contain"
                          unoptimized={!isOptimizableImage(imageUrl)}
                        />
                      </div>
                      <h4 className="font-[family-name:var(--font-inter)] font-bold text-[#202737] text-base text-center tracking-tight">
                        {name || labels.untitled}
                      </h4>
                    </>
                  );
                  const cardClassName =
                    'flex flex-col items-center p-6 bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow rounded-xl';

                  return item.href ? (
                    <Link key={item.id} href={item.href} className={cardClassName} data-product-card>
                      {card}
                    </Link>
                  ) : (
                    <div key={item.id} className={cardClassName} data-product-card>
                      {card}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
