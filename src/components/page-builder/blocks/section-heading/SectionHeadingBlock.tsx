'use client';

import React, { useEffect, useState } from 'react';
import { type SectionHeadingBlockData } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCollectionItem } from '@/contexts/CollectionItemContext';
import { useRepeaterEntry } from '@/contexts/RepeaterEntryContext';
import { useMockCollectionEntry } from '@/contexts/MockCollectionEntryContext';

type Block = SectionHeadingBlockData;

const SIZE_MAP: Record<string, { tag: 'h2' | 'h3' | 'h4'; fontSize: string; subFontSize: string }> = {
  sm: { tag: 'h4', fontSize: '16px', subFontSize: '13px' },
  md: { tag: 'h3', fontSize: '20px', subFontSize: '14px' },
  lg: { tag: 'h2', fontSize: '28px', subFontSize: '16px' },
};

// ── Editor ────────────────────────────────────────────────────────────────

export function SectionHeadingEditor({
  block,
  onChange,
}: {
  block: Block;
  onChange: (updates: Partial<Block>) => void;
}) {
  const size = block.size ?? 'md';
  const align = block.align ?? 'left';
  const showDivider = !!block.showDivider;

  return (
    <div className="p-4 border rounded-md space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs">Heading</Label>
        <Input
          value={block.heading ?? ''}
          onChange={(e) => onChange({ heading: e.target.value })}
          placeholder="Section title"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Subheading</Label>
        <Input
          value={block.subheading ?? ''}
          onChange={(e) => onChange({ subheading: e.target.value })}
          placeholder="Optional subheading"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Size</Label>
          <Select value={size} onValueChange={(v) => onChange({ size: v as Block['size'] })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small (h4)</SelectItem>
              <SelectItem value="md">Medium (h3)</SelectItem>
              <SelectItem value="lg">Large (h2)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Align</Label>
          <Select value={align} onValueChange={(v) => onChange({ align: v as Block['align'] })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-xs">Show Divider</Label>
        <Switch checked={showDivider} onCheckedChange={(v) => onChange({ showDivider: v })} />
      </div>

      {showDivider && (
        <div className="space-y-1.5">
          <Label className="text-xs">Divider Color</Label>
          <div className="flex gap-2">
            <Input
              value={block.dividerColor ?? ''}
              onChange={(e) => onChange({ dividerColor: e.target.value })}
              placeholder="#BC0D2A"
              className="h-8 text-xs font-mono flex-1"
            />
            {block.dividerColor && (
              <div
                className="h-8 w-8 rounded border shrink-0"
                style={{ backgroundColor: block.dividerColor }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Preview ───────────────────────────────────────────────────────────────

function useBoundValue(
  fieldKey: string | null | undefined,
  literal: string | undefined,
): string | undefined {
  const repeaterCtx = useRepeaterEntry();
  const mockCtx = useMockCollectionEntry();
  const collectionCtx = useCollectionItem();
  const [fetched, setFetched] = useState<string | null>(null);

  useEffect(() => {
    if (!fieldKey) return;
    if (repeaterCtx || mockCtx) return;
    if (!collectionCtx) return;
    fetch(`/api/entries/${collectionCtx.itemId}`)
      .then((r) => r.json())
      .then((entry) => {
        const v = entry?.data?.[fieldKey];
        setFetched(v != null ? String(v) : null);
      })
      .catch(() => {});
  }, [fieldKey, repeaterCtx, mockCtx, collectionCtx?.itemId]);

  if (fieldKey) {
    if (repeaterCtx) {
      const v = repeaterCtx.entryData[fieldKey];
      if (v != null) return String(v);
    }
    if (mockCtx) {
      const v = mockCtx.entryData[fieldKey];
      if (v != null) return String(v);
    }
    if (fetched) return fetched;
  }
  return literal;
}

export function SectionHeadingPreview({ block }: { block: Block }) {
  const size = block.size ?? 'md';
  const align = block.align ?? 'left';
  const { tag, fontSize, subFontSize } = SIZE_MAP[size];

  const heading = useBoundValue(block.headingFieldKey, block.heading);
  const subheading = useBoundValue(block.subheadingFieldKey, block.subheading);

  if (!heading && !subheading) return null;

  const dividerColor = block.dividerColor?.trim() || '#BC0D2A';

  const wrapperStyle: React.CSSProperties = {
    textAlign: align,
  };

  const headingStyle: React.CSSProperties = {
    fontSize,
    fontWeight: 700,
    lineHeight: 1.2,
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.01em',
  };

  const subheadingStyle: React.CSSProperties = {
    fontSize: subFontSize,
    color: '#64748b',
    margin: '0.5rem 0 0 0',
    fontWeight: 400,
  };

  const dividerAlign =
    align === 'center' ? '0 auto' : align === 'right' ? '0 0 0 auto' : '0';

  const dividerStyle: React.CSSProperties = {
    width: '48px',
    height: '3px',
    backgroundColor: dividerColor,
    marginTop: '0.75rem',
    margin: `0.75rem ${dividerAlign}`,
    borderRadius: '2px',
  };

  const HeadingTag = tag;

  return (
    <div style={wrapperStyle}>
      {heading &&
        React.createElement(HeadingTag, { style: headingStyle }, heading)}
      {block.showDivider && <div style={dividerStyle} />}
      {subheading && <p style={subheadingStyle}>{subheading}</p>}
    </div>
  );
}
