'use client';

import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Locale } from '@/lib/i18n/config';

const COLLECTION_SLUG = 'produit';

type FieldDef = {
  id: string;
  key: string;
  label: string;
  type: string;
  order: number | null;
};

type CollectionSummary = {
  id: string;
  slug: string;
  basePath: string | null;
};

type CollectionMeta = CollectionSummary & {
  name: string;
  itemSlugField: string | null;
  fields: FieldDef[];
};

type Entry = {
  id: string;
  slug: string | null;
  collectionId: string;
  data: Record<string, unknown>;
};

function getStringValue(entry: Entry, key: string): string {
  const v = entry.data?.[key];
  return typeof v === 'string' ? v : v == null ? '' : String(v);
}

export function NavSearchButton({ locale, searchLabel }: { locale: Locale; searchLabel: string }) {
  const [expanded, setExpanded] = useState(false);
  const [collection, setCollection] = useState<CollectionMeta | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        collapse();
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const collapse = () => {
    setExpanded(false);
    setSearch('');
    setIsOpen(false);
    setActiveIdx(-1);
  };

  const ensureLoaded = async () => {
    if (loaded || loading) return;
    setLoading(true);
    try {
      const listRes = await fetch('/api/collections');
      if (!listRes.ok) return;
      const list = (await listRes.json()) as CollectionSummary[];
      const match = list.find((c) => c.slug === COLLECTION_SLUG);
      if (!match) return;

      const [metaRes, entriesRes] = await Promise.all([
        fetch(`/api/collections/${match.id}`),
        fetch(`/api/entries?collectionId=${match.id}`),
      ]);
      if (!metaRes.ok || !entriesRes.ok) return;

      const meta = (await metaRes.json()) as CollectionMeta;
      const data = (await entriesRes.json()) as Entry[];
      setCollection(meta);
      setEntries(data);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  const nameKey = useMemo(() => {
    if (!collection) return null;
    if (collection.itemSlugField) return collection.itemSlugField;
    const ordered = [...collection.fields].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const firstText = ordered.find((f) => f.type === 'text');
    return (firstText ?? ordered[0])?.key ?? null;
  }, [collection]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q || !nameKey) return [] as Entry[];
    return entries
      .filter((e) => getStringValue(e, nameKey).toLowerCase().includes(q))
      .slice(0, 8);
  }, [entries, search, nameKey]);

  useEffect(() => {
    setActiveIdx(-1);
  }, [search]);

  const basePath = collection?.basePath ?? collection?.slug ?? COLLECTION_SLUG;
  const hrefFor = (entry: Entry) => `/${locale}/collections/${basePath}/${entry.slug ?? entry.id}`;

  const noResults = locale === 'fr' ? 'Aucun résultat' : 'No results';
  const loadingLabel = locale === 'fr' ? 'Chargement…' : 'Loading…';
  const placeholder = locale === 'fr' ? 'Chercher des produits…' : 'Search products…';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      collapse();
      return;
    }
    if (!isOpen || filtered.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => (i <= 0 ? filtered.length - 1 : i - 1));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      const target = filtered[activeIdx];
      if (target) window.location.href = hrefFor(target);
    }
  };

  const handleButtonClick = () => {
    setExpanded(true);
    void ensureLoaded();
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const showDropdown = isOpen && (search.trim().length > 0 || loading);

  if (!expanded) {
    return (
      <button
        aria-label={searchLabel}
        onClick={handleButtonClick}
        className="hidden sm:inline-flex bg-[#BC0D2A] p-2.5 rounded-md text-white hover:bg-[#9A0B22] transition-colors shadow-sm shadow-red-500/20"
      >
        <Search size={20} strokeWidth={2.5} />
      </button>
    );
  }

  return (
    <div className="relative hidden sm:block" ref={containerRef}>
      <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm transition-all focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-slate-100 w-[220px] lg:w-[260px]">
        <Search size={16} className="text-slate-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            void ensureLoaded();
          }}
          onFocus={() => {
            void ensureLoaded();
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={placeholder}
          className="flex-1 min-w-0 bg-transparent outline-none text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal"
        />
        <button
          onClick={collapse}
          aria-label="Close search"
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={15} strokeWidth={2.5} />
        </button>
      </div>

      {showDropdown && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-lg overflow-hidden py-1 max-h-80 overflow-y-auto text-left">
          {loading && !loaded ? (
            <div className="px-4 py-3 text-sm text-slate-400">{loadingLabel}</div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-400">{noResults}</div>
          ) : (
            filtered.map((entry, idx) => {
              const name = nameKey ? getStringValue(entry, nameKey) : entry.id;
              const active = idx === activeIdx;
              return (
                <Link
                  key={entry.id}
                  href={hrefFor(entry)}
                  className={`block px-4 py-2.5 text-sm transition-colors ${
                    active
                      ? 'bg-slate-50 text-[#BC0D2A]'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#BC0D2A]'
                  }`}
                  onMouseEnter={() => setActiveIdx(idx)}
                  onClick={() => { setIsOpen(false); collapse(); }}
                >
                  {name || entry.id}
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
