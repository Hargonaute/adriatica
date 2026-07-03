'use client';

import React from 'react';
import { useCollectionItem } from '@/contexts/CollectionItemContext';
import { useRepeaterEntry } from '@/contexts/RepeaterEntryContext';
import { useMockCollectionEntry } from '@/contexts/MockCollectionEntryContext';
import { type BoundImageBlockData } from '@/types';
import { cn } from '@/lib/utils';

const ASPECT_MAP: Record<string, string> = {
  '1:1': '1 / 1',
  '4:3': '4 / 3',
  '16:9': '16 / 9',
  '3:4': '3 / 4',
  // Back-compat with the earlier square/video/portrait keys
  square: '1 / 1',
  video: '16 / 9',
  portrait: '3 / 4',
};

const WIDTH_MAP: Record<string, string> = {
  full: '100%',
  half: '50%',
  third: '33.3333%',
  auto: 'auto',
};

const BORDER_RADIUS_MAP: Record<string, string> = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '16px',
  full: '9999px',
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

function BoundImageRender({
  src,
  block,
}: {
  src: string;
  block: BoundImageBlockData;
}) {
  const aspect = block.aspectRatio && block.aspectRatio !== 'auto'
    ? (ASPECT_MAP[block.aspectRatio] ?? undefined)
    : undefined;
  const objectFit = block.objectFit ?? 'cover';
  const width = WIDTH_MAP[block.width ?? 'full'];
  const borderRadius = BORDER_RADIUS_MAP[block.borderRadius ?? 'none'];
  const hideMobile = block.hideOnMobile;

  const wrapperStyle: React.CSSProperties = {
    width,
    aspectRatio: aspect,
    borderRadius,
    overflow: 'hidden',
  };

  const imgStyle: React.CSSProperties = {
    width: '100%',
    height: aspect ? '100%' : 'auto',
    objectFit,
    display: 'block',
  };

  return (
    <div
      style={wrapperStyle}
      className={cn(hideMobile && 'max-md:hidden @max-3xl/preview:hidden')}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" style={imgStyle} />
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

  if (!block.fieldKey) {
    return <Placeholder fieldKey={null} />;
  }

  // Inside a repeater: read value directly from context
  if (repeaterCtx) {
    const src = repeaterCtx.entryData[block.fieldKey];
    if (!src) return null;
    return <BoundImageRender src={String(src)} block={block} />;
  }

  // Template editor mock: render sample image
  if (mockCtx) {
    const src = mockCtx.entryData[block.fieldKey];
    if (!src) return <Placeholder fieldKey={block.fieldKey} />;
    return <BoundImageRender src={String(src)} block={block} />;
  }

  // Detail-page path: entry payload is populated server-side.
  if (collectionCtx?.entry) {
    const src = collectionCtx.entry.data[block.fieldKey];
    if (!src) return null;
    return <BoundImageRender src={String(src)} block={block} />;
  }

  return <Placeholder fieldKey={block.fieldKey} />;
}
