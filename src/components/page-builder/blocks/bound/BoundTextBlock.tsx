'use client';

import React, { useEffect, useState } from 'react';
import { useCollectionItem } from '@/contexts/CollectionItemContext';
import { useRepeaterEntry } from '@/contexts/RepeaterEntryContext';
import { useMockCollectionEntry } from '@/contexts/MockCollectionEntryContext';
import { type BoundTextBlockData } from '@/types';

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
  const [fetchedValue, setFetchedValue] = useState<string | null>(null);

  useEffect(() => {
    // Skip fetch when inside a repeater or when we have mock data — data comes from context
    if (repeaterCtx !== null || mockCtx !== null) return;
    if (!collectionCtx || !block.fieldKey) return;
    fetch(`/api/entries/${collectionCtx.itemId}`)
      .then((r) => r.json())
      .then((entry) => {
        const v = entry?.data?.[block.fieldKey!];
        setFetchedValue(v != null ? String(v) : null);
      })
      .catch(() => {});
  }, [repeaterCtx, mockCtx, collectionCtx?.itemId, block.fieldKey]);

  if (!block.fieldKey) {
    return <Placeholder fieldKey={null} />;
  }

  // Inside a repeater: read value directly from context (no API call)
  if (repeaterCtx) {
    const value = repeaterCtx.entryData[block.fieldKey];
    if (value == null) return null;
    return <p className="text-base text-foreground leading-relaxed">{String(value)}</p>;
  }

  // Template editor mock: render sample content so designers see realistic output
  if (mockCtx) {
    const value = mockCtx.entryData[block.fieldKey];
    if (value == null) return <Placeholder fieldKey={block.fieldKey} />;
    return <p className="text-base text-foreground leading-relaxed">{String(value)}</p>;
  }

  // Detail-page path: no context — show placeholder
  if (!collectionCtx) {
    return <Placeholder fieldKey={block.fieldKey} />;
  }

  if (fetchedValue === null) return null;
  return <p className="text-base text-foreground leading-relaxed">{fetchedValue}</p>;
}
