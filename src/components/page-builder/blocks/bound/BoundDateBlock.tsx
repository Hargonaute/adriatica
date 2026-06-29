'use client';

import React, { useEffect, useState } from 'react';
import { useCollectionItem } from '@/contexts/CollectionItemContext';
import { useRepeaterEntry } from '@/contexts/RepeaterEntryContext';
import { type BoundDateBlockData } from '@/types';

function formatDate(raw: string): string {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ── Editor ────────────────────────────────────────────────────────────────────

export function BoundDateEditor({
  block,
}: {
  block: BoundDateBlockData;
  onChange: (updates: Partial<BoundDateBlockData>) => void;
}) {
  return (
    <div className="border-2 border-dashed border-amber-300 rounded-lg p-6 text-center bg-amber-50/50">
      <p className="text-sm font-medium text-amber-600 font-mono">
        {block.fieldKey ? `[ ${block.fieldKey} ]` : 'Bound Date — select a field in the inspector'}
      </p>
    </div>
  );
}

// ── Preview ───────────────────────────────────────────────────────────────────

export function BoundDatePreview({ block }: { block: BoundDateBlockData }) {
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
      <div className="border-2 border-dashed border-amber-300 rounded-lg p-6 text-center bg-amber-50/50">
        <p className="text-sm font-medium text-amber-600 font-mono">
          Bound Date — select a field in the inspector
        </p>
      </div>
    );
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

  // Detail-page path: no context — show placeholder
  if (!collectionCtx) {
    return (
      <div className="border-2 border-dashed border-amber-300 rounded-lg p-6 text-center bg-amber-50/50">
        <p className="text-sm font-medium text-amber-600 font-mono">[ {block.fieldKey} ]</p>
      </div>
    );
  }

  if (!fetchedValue) return null;
  return (
    <time className="text-sm text-muted-foreground font-medium" dateTime={fetchedValue}>
      {formatDate(fetchedValue)}
    </time>
  );
}
