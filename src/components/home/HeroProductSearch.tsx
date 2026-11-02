'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/lib/i18n/config';
import { useProductSearch } from './useProductSearch';

export interface HeroProductSearchProps {
  placeholder: string;
  locale: Locale;
}

export function HeroProductSearch({ placeholder, locale }: HeroProductSearchProps) {
  const [search, setSearch] = useState('');
  const { ensureLoaded, loaded, loading, filtered, hrefFor } = useProductSearch(locale, search);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const noResults = locale === 'fr' ? 'Aucun résultat' : 'No results';
  const loadingLabel = locale === 'fr' ? 'Chargement…' : 'Loading…';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const showDropdown = isOpen && (search.trim().length > 0 || loading);

  return (
    <div className="relative w-full sm:w-[340px]" ref={containerRef}>
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-all focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-slate-100">
        <Search size={18} className="text-slate-400 shrink-0" />
        <input
          type="text"
          value={search}
          onFocus={() => {
            void ensureLoaded();
            setIsOpen(true);
          }}
          onChange={(e) => {
            setSearch(e.target.value);
            setActiveIdx(-1);
            void ensureLoaded();
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={placeholder}
          className="flex-1 min-w-0 bg-transparent outline-none text-[15px] font-semibold placeholder:text-slate-400 placeholder:font-semibold"
        />
      </div>

      {showDropdown && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-lg overflow-hidden py-1 max-h-80 overflow-y-auto text-left">
          {loading && !loaded ? (
            <div className="px-4 py-3 text-sm text-slate-400">{loadingLabel}</div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-400">{noResults}</div>
          ) : (
            filtered.map((product, idx) => {
              const active = idx === activeIdx;
              return (
                <Link
                  key={product.id}
                  href={hrefFor(product)}
                  className={`block px-4 py-2.5 text-sm transition-colors ${
                    active
                      ? 'bg-slate-50 text-[#BC0D2A]'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#BC0D2A]'
                  }`}
                  onMouseEnter={() => setActiveIdx(idx)}
                  onClick={() => setIsOpen(false)}
                >
                  {product.name}
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
