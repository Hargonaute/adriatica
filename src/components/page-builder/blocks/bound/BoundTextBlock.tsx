'use client';

import React from 'react';
import { useCollectionItem } from '@/contexts/CollectionItemContext';
import { useRepeaterEntry } from '@/contexts/RepeaterEntryContext';
import { useMockCollectionEntry } from '@/contexts/MockCollectionEntryContext';
import { type BoundTextBlockData } from '@/types';

const FONT_SIZE_MAP: Record<string, string> = {
  xs: '12px', sm: '14px', base: '16px', lg: '18px',
  xl: '20px', '2xl': '24px', '3xl': '30px', '4xl': '36px',
};

const FONT_WEIGHT_MAP: Record<string, string> = {
  normal: '400', medium: '500', semibold: '600', bold: '700',
};

function boundTextStyle(block: BoundTextBlockData): React.CSSProperties {
  const style: React.CSSProperties = {};
  if (block.fontSize && FONT_SIZE_MAP[block.fontSize]) style.fontSize = FONT_SIZE_MAP[block.fontSize];
  if (block.fontWeight && FONT_WEIGHT_MAP[block.fontWeight]) style.fontWeight = FONT_WEIGHT_MAP[block.fontWeight];
  const color = (block.textColor ?? '').trim();
  if (color) style.color = color;
  if (block.textTransform && block.textTransform !== 'none') style.textTransform = block.textTransform;
  return style;
}

function RenderedBoundText({
  block,
  value,
}: {
  block: BoundTextBlockData;
  value: string;
}) {
  const Tag = (block.as ?? 'p') as keyof React.JSX.IntrinsicElements;
  const style = boundTextStyle(block);
  // Only apply the default typography class when the user hasn't overridden
  // font size / weight / colour — otherwise inline styles win but the class
  // still adds unwanted line-height defaults on headings.
  const hasCustomTypography = !!(block.fontSize || block.fontWeight || block.textColor || block.textTransform);
  const className = hasCustomTypography ? undefined : 'text-base text-foreground leading-relaxed';
  return React.createElement(Tag, { className, style }, value);
}

function Placeholder({ fieldKey }: { fieldKey: string | null }) {
  return (
    <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50/50 relative">
      <span className="absolute top-1.5 left-2 text-[9px] font-semibold uppercase tracking-wider bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
        bound-text
      </span>
      <p className="text-sm font-medium text-blue-500 font-mono">
        {fieldKey ? `[ ${fieldKey} ]` : 'Bound Text — select a field in the inspector'}
      </p>
    </div>
  );
}

// ── Editor (canvas representation) ───────────────────────────────────────────

export function BoundTextEditor({
  block,
}: {
  block: BoundTextBlockData;
  onChange: (updates: Partial<BoundTextBlockData>) => void;
}) {
  return <Placeholder fieldKey={block.fieldKey} />;
}

// ── Preview (live render) ─────────────────────────────────────────────────────

export function BoundTextPreview({ block }: { block: BoundTextBlockData }) {
  const repeaterCtx = useRepeaterEntry();
  const mockCtx = useMockCollectionEntry();
  const collectionCtx = useCollectionItem();

  if (!block.fieldKey) {
    return <Placeholder fieldKey={null} />;
  }

  // Inside a repeater: read value directly from context (no API call)
  if (repeaterCtx) {
    const value = repeaterCtx.entryData[block.fieldKey];
    if (value == null) return null;
    return <RenderedBoundText block={block} value={String(value)} />;
  }

  // Template editor mock: render sample content so designers see realistic output
  if (mockCtx) {
    const value = mockCtx.entryData[block.fieldKey];
    if (value == null) return <Placeholder fieldKey={block.fieldKey} />;
    return <RenderedBoundText block={block} value={String(value)} />;
  }

  // Detail-page path: entry payload is populated server-side.
  if (collectionCtx?.entry) {
    const value = collectionCtx.entry.data[block.fieldKey];
    if (value == null) return null;
    return <RenderedBoundText block={block} value={String(value)} />;
  }

  // No context (e.g. static builder canvas) — show placeholder
  return <Placeholder fieldKey={block.fieldKey} />;
}
