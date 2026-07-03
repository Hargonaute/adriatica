'use client';

import React, { useMemo, useState } from 'react';
import { LayoutTemplate, Plus, Repeat2, Search } from 'lucide-react';
import { BLOCKS_REGISTRY, type BlockType } from './blocks/registry';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface BlockSelectorProps {
  onAdd: (type: string) => void;
  /** Custom trigger element. Falls back to a default "+ Add Block" button. */
  trigger?: React.ReactNode;
  /** Popover side — defaults to 'top' so it opens above buttons that sit at
   *  the bottom of the canvas. */
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  className?: string;
}

// Blocks defined outside the registry (no circular import). Exported so the
// Editor's drawer header can look up icon + label for container / repeater.
export const EXTRA_BLOCK_META: Record<
  string,
  { type: string; label: string; description: string; icon: React.ElementType }
> = {
  container: {
    type: 'container',
    label: 'Container',
    description: 'Flex layout — nest blocks side by side or stacked',
    icon: LayoutTemplate,
  },
  repeater: {
    type: 'repeater',
    label: 'Repeater',
    description: 'Renders one card per collection entry using a bound layout',
    icon: Repeat2,
  },
};

const CATEGORIES: { label: string; types: string[] }[] = [
  { label: 'Composite', types: ['product-hero'] },
  { label: 'Content', types: ['hero', 'rich-text', 'section-heading', 'cta', 'columns', 'table', 'key-value-list'] },
  { label: 'Media', types: ['image', 'video'] },
  { label: 'Interactive', types: ['form', 'newsletter', 'contact-form', 'collection-list', 'download-button'] },
  { label: 'Layout', types: ['container', 'spacer'] },
  { label: 'Template', types: ['repeater', 'collection-item-fields', 'bound-text', 'bound-image', 'bound-rich-text', 'bound-date'] },
];

export function BlockSelector({
  onAdd,
  trigger,
  side = 'top',
  align = 'center',
  className,
}: BlockSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

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

  const handleSelect = (type: string) => {
    onAdd(type);
    setOpen(false);
    setSearch('');
  };

  const totalVisible = allCategories.reduce((acc, cat) => {
    return (
      acc +
      cat.types
        .map((t) => EXTRA_BLOCK_META[t] ?? BLOCKS_REGISTRY[t])
        .filter(Boolean)
        .filter(matches).length
    );
  }, 0);

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setSearch('');
      }}
    >
      <PopoverTrigger asChild>
        {trigger ?? (
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'h-9 gap-1.5 border-dashed text-xs font-semibold text-slate-600 dark:text-slate-300',
              className
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Block
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        sideOffset={8}
        className="p-0 w-80 max-h-[480px] flex flex-col"
      >
        <div className="px-3 pt-3 pb-2 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <Input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search blocks…"
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-3">
            {allCategories.map((category) => {
              const blocks = category.types
                .map((type) => EXTRA_BLOCK_META[type] ?? BLOCKS_REGISTRY[type])
                .filter(Boolean)
                .filter(matches);

              if (blocks.length === 0) return null;

              return (
                <div key={category.label}>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 mb-1">
                    {category.label}
                  </p>
                  <div className="space-y-0.5">
                    {blocks.map((block) => {
                      const Icon = block.icon;
                      return (
                        <button
                          key={block.type}
                          onClick={() => handleSelect(block.type as BlockType)}
                          className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                        >
                          <div className="p-1.5 bg-slate-100 dark:bg-slate-800 group-hover:bg-[#BC0D2A]/10 rounded-md transition-colors shrink-0">
                            <Icon className="h-3.5 w-3.5 text-slate-500 group-hover:text-[#BC0D2A] transition-colors" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-tight truncate">
                              {block.label}
                            </p>
                            {block.description && (
                              <p className="text-[10px] text-slate-400 mt-0.5 leading-tight truncate">
                                {block.description}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {totalVisible === 0 && (
              <p className="text-xs text-slate-400 px-2 py-6 text-center">
                No blocks match &ldquo;{search}&rdquo;
              </p>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
