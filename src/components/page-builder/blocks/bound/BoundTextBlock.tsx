'use client';

import React, { useEffect, useState } from 'react';
import { useCollectionItem } from '@/contexts/CollectionItemContext';
import { useRepeaterEntry } from '@/contexts/RepeaterEntryContext';
import { type BoundTextBlockData } from '@/types';

// ── Editor (canvas representation) ───────────────────────────────────────────

export function BoundTextEditor({
  block,
}: {
  block: BoundTextBlockData;
  onChange: (updates: Partial<BoundTextBlockData>) => void;
}) {
  return (
    <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50/50">
      <p className="text-sm font-medium text-blue-500 font-mono">
        {block.fieldKey ? `[ ${block.fieldKey} ]` : 'Bound Text — select a field in the inspector'}
      </p>
    </div>
  );
}

// ── Preview (live render) ─────────────────────────────────────────────────────

export function BoundTextPreview({ block }: { block: BoundTextBlockData }) {
  const repeaterCtx = useRepeaterEntry();
  const collectionCtx = useCollectionItem();
  const [fetchedValue, setFetchedValue] = useState<string | null>(null);

  useEffect(() => {
    // Skip fetch when inside a repeater — data comes from context directly
    if (repeaterCtx !== null) return;
    if (!collectionCtx || !block.fieldKey) return;
    fetch(`/api/entries/${collectionCtx.itemId}`)
      .then((r) => r.json())
      .then((entry) => {
        const v = entry?.data?.[block.fieldKey!];
        setFetchedValue(v != null ? String(v) : null);
      })
      .catch(() => {});
  }, [repeaterCtx, collectionCtx?.itemId, block.fieldKey]);

  if (!block.fieldKey) {
    return (
      <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50/50">
        <p className="text-sm font-medium text-blue-500 font-mono">
          Bound Text — select a field in the inspector
        </p>
      </div>
    );
  }

  // Inside a repeater: read value directly from context (no API call)
  if (repeaterCtx) {
    const value = repeaterCtx.entryData[block.fieldKey];
    if (value == null) return null;
    return <p className="text-base text-foreground leading-relaxed">{String(value)}</p>;
  }

  // Detail-page path: no context — show placeholder
  if (!collectionCtx) {
    return (
      <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50/50">
        <p className="text-sm font-medium text-blue-500 font-mono">[ {block.fieldKey} ]</p>
      </div>
    );
  }

  if (fetchedValue === null) return null;
  return <p className="text-base text-foreground leading-relaxed">{fetchedValue}</p>;
}
