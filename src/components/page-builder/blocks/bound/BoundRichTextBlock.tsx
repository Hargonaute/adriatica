'use client';

import React, { useEffect, useState } from 'react';
import { useCollectionItem } from '@/contexts/CollectionItemContext';
import { useRepeaterEntry } from '@/contexts/RepeaterEntryContext';
import { useMockCollectionEntry } from '@/contexts/MockCollectionEntryContext';
import { type BoundRichTextBlockData } from '@/types';
import { PROSE_CLASSES } from '../proseClasses';

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
  const [fetchedHtml, setFetchedHtml] = useState<string | null>(null);

  useEffect(() => {
    // Skip fetch when inside a repeater or when we have mock data — data comes from context
    if (repeaterCtx !== null || mockCtx !== null) return;
    if (!collectionCtx || !block.fieldKey) return;
    fetch(`/api/entries/${collectionCtx.itemId}`)
      .then((r) => r.json())
      .then((entry) => {
        const v = entry?.data?.[block.fieldKey!];
        setFetchedHtml(v ? String(v) : null);
      })
      .catch(() => {});
  }, [repeaterCtx, mockCtx, collectionCtx?.itemId, block.fieldKey]);

  if (!block.fieldKey) {
    return <Placeholder fieldKey={null} />;
  }

  // Inside a repeater: read value directly from context
  if (repeaterCtx) {
    const html = repeaterCtx.entryData[block.fieldKey];
    if (!html) return null;
    return <div className={PROSE_CLASSES} dangerouslySetInnerHTML={{ __html: String(html) }} />;
  }

  // Template editor mock: render sample rich-text
  if (mockCtx) {
    const html = mockCtx.entryData[block.fieldKey];
    if (!html) return <Placeholder fieldKey={block.fieldKey} />;
    return <div className={PROSE_CLASSES} dangerouslySetInnerHTML={{ __html: String(html) }} />;
  }

  // Detail-page path: no context — show placeholder
  if (!collectionCtx) {
    return <Placeholder fieldKey={block.fieldKey} />;
  }

  if (!fetchedHtml) return null;
  return <div className={PROSE_CLASSES} dangerouslySetInnerHTML={{ __html: fetchedHtml }} />;
}
