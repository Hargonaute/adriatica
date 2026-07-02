'use client';

import React, { useEffect, useState } from 'react';
import { useCollectionItem } from '@/contexts/CollectionItemContext';
import { useRepeaterEntry } from '@/contexts/RepeaterEntryContext';
import { useMockCollectionEntry } from '@/contexts/MockCollectionEntryContext';
import { type BoundImageBlockData } from '@/types';

const ASPECT_CLASSES: Record<string, string> = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
};

function Placeholder({ fieldKey }: { fieldKey: string | null }) {
  return (
    <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center bg-purple-50/50 relative">
      <span className="absolute top-1.5 left-2 text-[9px] font-semibold uppercase tracking-wider bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
        bound-image
      </span>
      <p className="text-sm font-medium text-purple-500 font-mono">
        {fieldKey ? `[ ${fieldKey} ]` : 'Bound Image — select a field in the inspector'}
      </p>
    </div>
  );
}

function ImageWithAspect({ src, aspect }: { src: string; aspect: string | null }) {
  const aspectClass = aspect ? (ASPECT_CLASSES[aspect] ?? '') : '';
  return (
    <div className={aspectClass || undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className={`w-full rounded-xl object-cover ${aspectClass ? 'h-full' : ''}`}
      />
    </div>
  );
}

// ── Editor ────────────────────────────────────────────────────────────────────

export function BoundImageEditor({
  block,
}: {
  block: BoundImageBlockData;
  onChange: (updates: Partial<BoundImageBlockData>) => void;
}) {
  return <Placeholder fieldKey={block.fieldKey} />;
}

// ── Preview ───────────────────────────────────────────────────────────────────

export function BoundImagePreview({ block }: { block: BoundImageBlockData }) {
  const repeaterCtx = useRepeaterEntry();
  const mockCtx = useMockCollectionEntry();
  const collectionCtx = useCollectionItem();
  const [fetchedSrc, setFetchedSrc] = useState<string | null>(null);

  useEffect(() => {
    // Skip fetch when inside a repeater or when we have mock data — data comes from context
    if (repeaterCtx !== null || mockCtx !== null) return;
    if (!collectionCtx || !block.fieldKey) return;
    fetch(`/api/entries/${collectionCtx.itemId}`)
      .then((r) => r.json())
      .then((entry) => {
        const v = entry?.data?.[block.fieldKey!];
        setFetchedSrc(v ? String(v) : null);
      })
      .catch(() => {});
  }, [repeaterCtx, mockCtx, collectionCtx?.itemId, block.fieldKey]);

  if (!block.fieldKey) {
    return <Placeholder fieldKey={null} />;
  }

  // Inside a repeater: read value directly from context
  if (repeaterCtx) {
    const src = repeaterCtx.entryData[block.fieldKey];
    if (!src) return null;
    return <ImageWithAspect src={String(src)} aspect={block.aspectRatio ?? null} />;
  }

  // Template editor mock: render sample image
  if (mockCtx) {
    const src = mockCtx.entryData[block.fieldKey];
    if (!src) return <Placeholder fieldKey={block.fieldKey} />;
    return <ImageWithAspect src={String(src)} aspect={block.aspectRatio ?? null} />;
  }

  // Detail-page path: no context — show placeholder
  if (!collectionCtx) {
    return <Placeholder fieldKey={block.fieldKey} />;
  }

  if (!fetchedSrc) return null;
  return <ImageWithAspect src={fetchedSrc} aspect={block.aspectRatio ?? null} />;
}
