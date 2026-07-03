'use client';

import React from 'react';
import { useCollectionItem } from '@/contexts/CollectionItemContext';
import { useRepeaterEntry } from '@/contexts/RepeaterEntryContext';
import { useMockCollectionEntry } from '@/contexts/MockCollectionEntryContext';
import { type BoundRichTextBlockData } from '@/types';
import { PROSE_CLASSES } from '../proseClasses';

const FONT_SIZE_MAP: Record<string, string> = {
  xs: '12px', sm: '14px', base: '16px', lg: '18px',
  xl: '20px', '2xl': '24px', '3xl': '30px', '4xl': '36px',
};

const FONT_WEIGHT_MAP: Record<string, string> = {
  normal: '400', medium: '500', semibold: '600', bold: '700',
};

function richTextStyle(block: BoundRichTextBlockData): React.CSSProperties {
  const style: React.CSSProperties = {};
  if (block.fontSize && FONT_SIZE_MAP[block.fontSize]) style.fontSize = FONT_SIZE_MAP[block.fontSize];
  if (block.fontWeight && FONT_WEIGHT_MAP[block.fontWeight]) style.fontWeight = FONT_WEIGHT_MAP[block.fontWeight];
  const color = (block.textColor ?? '').trim();
  if (color) style.color = color;
  if (block.textTransform && block.textTransform !== 'none') style.textTransform = block.textTransform;
  return style;
}

function Placeholder({ fieldKey }: { fieldKey: string | null }) {
  return (
    <div className="border-2 border-dashed border-emerald-300 rounded-lg p-6 text-center bg-emerald-50/50 relative">
      <span className="absolute top-1.5 left-2 text-[9px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
        bound-rich-text
      </span>
      <p className="text-sm font-medium text-emerald-600 font-mono">
        {fieldKey ? `[ ${fieldKey} ]` : 'Bound Rich Text — select a field in the inspector'}
      </p>
    </div>
  );
}

// ── Editor ────────────────────────────────────────────────────────────────────

export function BoundRichTextEditor({
  block,
}: {
  block: BoundRichTextBlockData;
  onChange: (updates: Partial<BoundRichTextBlockData>) => void;
}) {
  return <Placeholder fieldKey={block.fieldKey} />;
}

// ── Preview ───────────────────────────────────────────────────────────────────

export function BoundRichTextPreview({ block }: { block: BoundRichTextBlockData }) {
  const repeaterCtx = useRepeaterEntry();
  const mockCtx = useMockCollectionEntry();
  const collectionCtx = useCollectionItem();

  if (!block.fieldKey) {
    return <Placeholder fieldKey={null} />;
  }

  const style = richTextStyle(block);

  // Inside a repeater: read value directly from context
  if (repeaterCtx) {
    const html = repeaterCtx.entryData[block.fieldKey];
    if (!html) return null;
    return <div className={PROSE_CLASSES} style={style} dangerouslySetInnerHTML={{ __html: String(html) }} />;
  }

  // Template editor mock: render sample rich-text
  if (mockCtx) {
    const html = mockCtx.entryData[block.fieldKey];
    if (!html) return <Placeholder fieldKey={block.fieldKey} />;
    return <div className={PROSE_CLASSES} style={style} dangerouslySetInnerHTML={{ __html: String(html) }} />;
  }

  // Detail-page path: entry payload is populated server-side.
  if (collectionCtx?.entry) {
    const html = collectionCtx.entry.data[block.fieldKey];
    if (!html) return null;
    return <div className={PROSE_CLASSES} style={style} dangerouslySetInnerHTML={{ __html: String(html) }} />;
  }

  return <Placeholder fieldKey={block.fieldKey} />;
}
