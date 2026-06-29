'use client';

import React, { useEffect, useState } from 'react';
import { useCollectionItem } from '@/contexts/CollectionItemContext';
import { useRepeaterEntry } from '@/contexts/RepeaterEntryContext';
import { type BoundImageBlockData } from '@/types';

const ASPECT_CLASSES: Record<string, string> = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
};

// ── Editor ────────────────────────────────────────────────────────────────────

export function BoundImageEditor({
  block,
}: {
  block: BoundImageBlockData;
  onChange: (updates: Partial<BoundImageBlockData>) => void;
}) {
  return (
    <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center bg-purple-50/50">
      <p className="text-sm font-medium text-purple-500 font-mono">
        {block.fieldKey ? `[ ${block.fieldKey} ]` : 'Bound Image — select a field in the inspector'}
      </p>
    </div>
  );
}

// ── Preview ───────────────────────────────────────────────────────────────────

export function BoundImagePreview({ block }: { block: BoundImageBlockData }) {
  const repeaterCtx = useRepeaterEntry();
  const collectionCtx = useCollectionItem();
  const [fetchedSrc, setFetchedSrc] = useState<string | null>(null);

  useEffect(() => {
    // Skip fetch when inside a repeater — data comes from context directly
    if (repeaterCtx !== null) return;
    if (!collectionCtx || !block.fieldKey) return;
    fetch(`/api/entries/${collectionCtx.itemId}`)
      .then((r) => r.json())
      .then((entry) => {
        const v = entry?.data?.[block.fieldKey!];
        setFetchedSrc(v ? String(v) : null);
      })
      .catch(() => {});
  }, [repeaterCtx, collectionCtx?.itemId, block.fieldKey]);

  if (!block.fieldKey) {
    return (
      <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center bg-purple-50/50">
        <p className="text-sm font-medium text-purple-500 font-mono">
          Bound Image — select a field in the inspector
        </p>
      </div>
    );
  }

  // Inside a repeater: read value directly from context
  if (repeaterCtx) {
    const src = repeaterCtx.entryData[block.fieldKey];
    if (!src) return null;
    const aspectClass = block.aspectRatio ? (ASPECT_CLASSES[block.aspectRatio] ?? '') : '';
    return (
      <div className={aspectClass || undefined}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={String(src)}
          alt=""
          className={`w-full rounded-xl object-cover ${aspectClass ? 'h-full' : ''}`}
        />
      </div>
    );
  }

  // Detail-page path: no context — show placeholder
  if (!collectionCtx) {
    return (
      <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center bg-purple-50/50">
        <p className="text-sm font-medium text-purple-500 font-mono">[ {block.fieldKey} ]</p>
      </div>
    );
  }

  if (!fetchedSrc) return null;

  const aspectClass = block.aspectRatio ? (ASPECT_CLASSES[block.aspectRatio] ?? '') : '';
  return (
    <div className={aspectClass || undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={fetchedSrc}
        alt=""
        className={`w-full rounded-xl object-cover ${aspectClass ? 'h-full' : ''}`}
      />
    </div>
  );
}
