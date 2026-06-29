'use client';

import React from 'react';
import { LayoutTemplate, Repeat2 } from 'lucide-react';
import { BLOCKS_REGISTRY, type BlockType } from './blocks/registry';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface BlockSelectorProps {
  onAdd: (type: string) => void;
  className?: string;
}

// Blocks defined outside the registry (no circular import)
const EXTRA_BLOCK_META: Record<string, { type: string; label: string; description: string; icon: React.ElementType }> = {
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

// Group blocks into logical categories
const CATEGORIES: { label: string; types: string[] }[] = [
  { label: 'Content', types: ['hero', 'rich-text', 'cta', 'columns'] },
  { label: 'Media', types: ['image', 'video'] },
  { label: 'Interactive', types: ['form', 'newsletter', 'contact-form', 'collection-list'] },
  { label: 'Layout', types: ['container', 'spacer'] },
  { label: 'Template', types: ['repeater', 'bound-text', 'bound-image', 'bound-rich-text', 'bound-date'] },
];

export function BlockSelector({ onAdd, className }: BlockSelectorProps) {
  // Build ordered list from categories so uncategorised blocks still appear
  const categorised = new Set(CATEGORIES.flatMap((c) => c.types));
  const uncategorised = Object.keys(BLOCKS_REGISTRY).filter((t) => !categorised.has(t));

  const allCategories = [
    ...CATEGORIES,
    ...(uncategorised.length > 0 ? [{ label: 'Other', types: uncategorised }] : []),
  ];

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Add Block
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-5">
          {allCategories.map((category) => {
            const blocks = category.types
              .map((type) => EXTRA_BLOCK_META[type] ?? BLOCKS_REGISTRY[type])
              .filter(Boolean);

            if (blocks.length === 0) return null;

            return (
              <div key={category.label}>
                {/* Category label */}
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 mb-1.5">
                  {category.label}
                </p>

                {/* Block buttons */}
                <div className="space-y-1">
                  {blocks.map((block) => {
                    const Icon = block.icon;
                    return (
                      <button
                        key={block.type}
                        onClick={() => onAdd(block.type as BlockType)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                      >
                        <div className="p-1.5 bg-slate-100 dark:bg-slate-800 group-hover:bg-[#BC0D2A]/10 rounded-md transition-colors shrink-0">
                          <Icon className="h-3.5 w-3.5 text-slate-500 group-hover:text-[#BC0D2A] transition-colors" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white leading-none">
                            {block.label}
                          </p>
                          {block.description && (
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate leading-none">
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
        </div>
      </ScrollArea>
    </div>
  );
}
