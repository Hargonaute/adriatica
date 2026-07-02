'use client';

import React, { useEffect, useState } from 'react';
import { useCollectionItem } from '@/contexts/CollectionItemContext';
import { useRepeaterEntry } from '@/contexts/RepeaterEntryContext';
import { useMockCollectionEntry } from '@/contexts/MockCollectionEntryContext';
import { type BoundDateBlockData } from '@/types';

function formatDate(raw: string): string {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function Placeholder({ fieldKey }: { fieldKey: string | null }) {
  return (
    <div className="border-2 border-dashed border-amber-300 rounded-lg p-6 text-center bg-amber-50/50 relative">
      <span className="absolute top-1.5 left-2 text-[9px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
        bound-date
      </span>
      <p className="text-sm font-medium text-amber-600 font-mono">
        {fieldKey ? `[ ${fieldKey} ]` : 'Bound Date — select a field in the inspector'}
      </p>
    </div>
  );
}

// ── Editor ────────────────────────────────────────────────────────────────────

export function BoundDateEditor({
  block,
}: {
  block: BoundDateBlockData;
  onChange: (updates: Partial<BoundDateBlockData>) => void;
}) {
  return <Placeholder fieldKey={block.fieldKey} />;
}

// ── Preview ───────────────────────────────────────────────────────────────────

export function BoundDatePreview({ block }: { block: BoundDateBlockData }) {
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

  // Inside a repeater: read value directly from context
  if (repeaterCtx) {
    const value = repeaterCtx.entryData[block.fieldKey];
    if (value == null) return null;
    const str = String(value);
    return (
      <time className="text-sm text-muted-foreground font-medium" dateTime={str}>
        {formatDate(str)}
      </time>
    );
  }

  // Template editor mock: render sample formatted date
  if (mockCtx) {
    const value = mockCtx.entryData[block.fieldKey];
    if (value == null) return <Placeholder fieldKey={block.fieldKey} />;
    const str = String(value);
    return (
      <time className="text-sm text-muted-foreground font-medium" dateTime={str}>
        {formatDate(str)}
      </time>
    );
  }

  // Detail-page path: no context — show placeholder
  if (!collectionCtx) {
    return <Placeholder fieldKey={block.fieldKey} />;
  }

  if (!fetchedValue) return null;
  return (
    <time className="text-sm text-muted-foreground font-medium" dateTime={fetchedValue}>
      {formatDate(fetchedValue)}
    </time>
  );
}
