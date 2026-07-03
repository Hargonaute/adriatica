'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react';
import { BLOCKS_REGISTRY } from './blocks/registry';
import { EXTRA_BLOCK_META } from './BlockSelector';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface BlockSidebarProps {
  onAdd: (type: string) => void;
}

const CATEGORIES: { label: string; types: string[] }[] = [
  { label: 'Composite', types: ['product-hero'] },
  { label: 'Content', types: ['hero', 'rich-text', 'section-heading', 'cta', 'columns', 'table', 'key-value-list'] },
  { label: 'Media', types: ['image', 'video'] },
  { label: 'Interactive', types: ['form', 'newsletter', 'contact-form', 'collection-list', 'download-button'] },
  { label: 'Layout', types: ['container', 'spacer'] },
  { label: 'Template', types: ['repeater', 'collection-item-fields', 'bound-text', 'bound-image', 'bound-rich-text', 'bound-date'] },
];

export function BlockSidebar({ onAdd }: BlockSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedCollapsed = localStorage.getItem('pb.sidebarCollapsed');
      if (savedCollapsed !== null) setCollapsed(savedCollapsed === 'true');
      const initial: Record<string, boolean> = {};
      CATEGORIES.forEach((c) => {
        const v = localStorage.getItem(`pb.category.${c.label}`);
        initial[c.label] = v === null ? true : v === 'true';
      });
      setOpenCategories(initial);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem('pb.sidebarCollapsed', String(collapsed)); } catch {}
  }, [collapsed, hydrated]);

  const toggleCategory = (label: string) => {
    setOpenCategories((prev) => {
      const next = { ...prev, [label]: !(prev[label] ?? true) };
      try { localStorage.setItem(`pb.category.${label}`, String(next[label])); } catch {}
      return next;
    });
  };

  const allCategories = useMemo(() => {
    const categorised = new Set(CATEGORIES.flatMap((c) => c.types));
    const uncategorised = Object.keys(BLOCKS_REGISTRY).filter((t) => !categorised.has(t));
    return [
      ...CATEGORIES,
      ...(uncategorised.length > 0 ? [{ label: 'Other', types: uncategorised }] : []),
    ];
  }, []);

  const query = search.trim().toLowerCase();
  const matches = (block: { label: string; description?: string }) =>
    !query ||
    block.label.toLowerCase().includes(query) ||
    (block.description ?? '').toLowerCase().includes(query);

  const totalVisible = allCategories.reduce((acc, cat) => {
    return (
      acc +
      cat.types
        .map((t) => EXTRA_BLOCK_META[t] ?? BLOCKS_REGISTRY[t])
        .filter(Boolean)
        .filter(matches).length
    );
  }, 0);

  const forceOpenAll = query.length > 0;

  return (
    <aside
      className={cn(
        'shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-[width] duration-200 overflow-hidden',
        collapsed ? 'w-12' : 'w-[200px]'
      )}
    >
      {/* Header with collapse toggle */}
      <div className="flex items-center h-10 px-2 border-b border-slate-200 dark:border-slate-800 shrink-0">
        {!collapsed && (
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 px-1.5">
            Blocks
          </span>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand block sidebar' : 'Collapse block sidebar'}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-auto"
        >
          {collapsed ? <ChevronsRight className="h-3.5 w-3.5" /> : <ChevronsLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Search (hidden when collapsed) */}
      {!collapsed && (
        <div className="px-2 py-2 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="relative">
            <Search className="h-3 w-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="h-7 pl-6 text-xs"
            />
          </div>
        </div>
      )}

      {/* Blocks list */}
      <div className="flex-1 overflow-y-auto py-1.5">
        {allCategories.map((category) => {
          const blocks = category.types
            .map((type) => EXTRA_BLOCK_META[type] ?? BLOCKS_REGISTRY[type])
            .filter(Boolean)
            .filter(matches);

          if (blocks.length === 0) return null;

          const isOpen = openCategories[category.label] ?? true;
          const showBlocks = forceOpenAll || isOpen;

          return (
            <div key={category.label} className="mb-1">
              {!collapsed && (
                <button
                  type="button"
                  onClick={() => toggleCategory(category.label)}
                  aria-expanded={showBlocks}
                  className="w-full flex items-center gap-1 px-2 py-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                  {showBlocks ? (
                    <ChevronDown className="h-3 w-3 shrink-0" />
                  ) : (
                    <ChevronRight className="h-3 w-3 shrink-0" />
                  )}
                  <span className="text-[10px] font-semibold uppercase tracking-widest">
                    {category.label}
                  </span>
                </button>
              )}

              {(collapsed || showBlocks) && (
                <div className={cn('space-y-0.5', collapsed ? 'px-1' : 'px-1.5')}>
                  {blocks.map((block) => {
                    const Icon = block.icon;
                    const tip = collapsed
                      ? `${block.label}${block.description ? ' — ' + block.description : ''}`
                      : undefined;
                    return (
                      <button
                        key={block.type}
                        onClick={() => onAdd(block.type)}
                        title={tip}
                        aria-label={collapsed ? block.label : undefined}
                        className={cn(
                          'w-full flex items-center gap-2 rounded-md text-left group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800',
                          collapsed ? 'justify-center p-1.5' : 'px-1.5 py-1'
                        )}
                      >
                        <div className="p-1 shrink-0 rounded-md bg-slate-100 dark:bg-slate-800 group-hover:bg-[#BC0D2A]/10 transition-colors">
                          <Icon className="h-3.5 w-3.5 text-slate-500 group-hover:text-[#BC0D2A] transition-colors" />
                        </div>
                        {!collapsed && (
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                            {block.label}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {!collapsed && query && totalVisible === 0 && (
          <p className="text-[11px] text-slate-400 px-3 py-4 text-center">
            No blocks match &ldquo;{search}&rdquo;
          </p>
        )}
      </div>
    </aside>
  );
}
