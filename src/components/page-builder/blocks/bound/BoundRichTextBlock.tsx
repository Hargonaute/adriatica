'use client';

import React, { useEffect, useState } from 'react';
import { useCollectionItem } from '@/contexts/CollectionItemContext';
import { useRepeaterEntry } from '@/contexts/RepeaterEntryContext';
import { type BoundRichTextBlockData } from '@/types';
import { PROSE_CLASSES } from '../proseClasses';

// ── Editor ────────────────────────────────────────────────────────────────────

export function BoundRichTextEditor({
  block,
}: {
  block: BoundRichTextBlockData;
  onChange: (updates: Partial<BoundRichTextBlockData>) => void;
}) {
  return (
    <div className="border-2 border-dashed border-emerald-300 rounded-lg p-6 text-center bg-emerald-50/50">
      <p className="text-sm font-medium text-emerald-600 font-mono">
        {block.fieldKey ? `[ ${block.fieldKey} ]` : 'Bound Rich Text — select a field in the inspector'}
      </p>
    </div>
  );
}

// ── Preview ───────────────────────────────────────────────────────────────────

export function BoundRichTextPreview({ block }: { block: BoundRichTextBlockData }) {
  const repeaterCtx = useRepeaterEntry();
  const collectionCtx = useCollectionItem();
  const [fetchedHtml, setFetchedHtml] = useState<string | null>(null);

  useEffect(() => {
    // Skip fetch when inside a repeater — data comes from context directly
    if (repeaterCtx !== null) return;
    if (!collectionCtx || !block.fieldKey) return;
    fetch(`/api/entries/${collectionCtx.itemId}`)
      .then((r) => r.json())
      .then((entry) => {
        const v = entry?.data?.[block.fieldKey!];
        setFetchedHtml(v ? String(v) : null);
      })
      .catch(() => {});
  }, [repeaterCtx, collectionCtx?.itemId, block.fieldKey]);

  if (!block.fieldKey) {
    return (
      <div className="border-2 border-dashed border-emerald-300 rounded-lg p-6 text-center bg-emerald-50/50">
        <p className="text-sm font-medium text-emerald-600 font-mono">
          Bound Rich Text — select a field in the inspector
        </p>
      </div>
    );
  }

  // Inside a repeater: read value directly from context
  if (repeaterCtx) {
    const html = repeaterCtx.entryData[block.fieldKey];
    if (!html) return null;
    return <div className={PROSE_CLASSES} dangerouslySetInnerHTML={{ __html: String(html) }} />;
  }

  // Detail-page path: no context — show placeholder
  if (!collectionCtx) {
    return (
      <div className="border-2 border-dashed border-emerald-300 rounded-lg p-6 text-center bg-emerald-50/50">
        <p className="text-sm font-medium text-emerald-600 font-mono">[ {block.fieldKey} ]</p>
      </div>
    );
  }

  if (!fetchedHtml) return null;
  return <div className={PROSE_CLASSES} dangerouslySetInnerHTML={{ __html: fetchedHtml }} />;
}
