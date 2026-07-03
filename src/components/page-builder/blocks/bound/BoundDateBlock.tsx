'use client';

import React from 'react';
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

function renderDate(str: string) {
  return (
    <time className="text-sm text-muted-foreground font-medium" dateTime={str}>
      {formatDate(str)}
    </time>
  );
}

export function BoundDatePreview({ block }: { block: BoundDateBlockData }) {
  const repeaterCtx = useRepeaterEntry();
  const mockCtx = useMockCollectionEntry();
  const collectionCtx = useCollectionItem();

  if (!block.fieldKey) {
    return <Placeholder fieldKey={null} />;
  }

  // Inside a repeater: read value directly from context
  if (repeaterCtx) {
    const value = repeaterCtx.entryData[block.fieldKey];
    if (value == null) return null;
    return renderDate(String(value));
  }

  // Template editor mock: render sample formatted date
  if (mockCtx) {
    const value = mockCtx.entryData[block.fieldKey];
    if (value == null) return <Placeholder fieldKey={block.fieldKey} />;
    return renderDate(String(value));
  }

  // Detail-page path: entry payload is populated server-side.
  if (collectionCtx?.entry) {
    const value = collectionCtx.entry.data[block.fieldKey];
    if (value == null) return null;
    return renderDate(String(value));
  }

  return <Placeholder fieldKey={block.fieldKey} />;
}
