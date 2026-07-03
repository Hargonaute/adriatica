'use client';

import React, { useEffect, useState } from 'react';
import { type DownloadButtonBlockData } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AssetPicker } from '../../AssetPicker';
import { ArrowDownToLine, ExternalLink, X, FileDown } from 'lucide-react';
import { useCollectionItem } from '@/contexts/CollectionItemContext';
import { useRepeaterEntry } from '@/contexts/RepeaterEntryContext';
import { useMockCollectionEntry } from '@/contexts/MockCollectionEntryContext';

type Block = DownloadButtonBlockData;

// ── Editor ────────────────────────────────────────────────────────────────

export function DownloadButtonEditor({
  block,
  onChange,
}: {
  block: Block;
  onChange: (updates: Partial<Block>) => void;
}) {
  return (
    <div className="p-4 border rounded-md space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Button Label</Label>
          <Input
            value={block.label ?? ''}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="Download"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Variant</Label>
          <Select
            value={block.variant ?? 'primary'}
            onValueChange={(v) => onChange({ variant: v as Block['variant'] })}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">Primary</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
              <SelectItem value="ghost">Ghost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">File / URL</Label>
        {block.url ? (
          <div className="flex items-center gap-2 border rounded-md p-2 bg-muted/20">
            <FileDown className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-xs font-mono truncate flex-1">{block.url}</span>
            <AssetPicker
              onSelect={(url) => onChange({ url })}
              trigger={<Button size="sm" variant="secondary" className="h-7 text-xs">Change</Button>}
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => onChange({ url: '' })}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <AssetPicker onSelect={(url) => onChange({ url })} />
            <Input
              value={block.url ?? ''}
              onChange={(e) => onChange({ url: e.target.value })}
              placeholder="or paste URL"
              className="h-8 text-xs font-mono flex-1"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Icon</Label>
          <Select
            value={block.icon ?? 'download'}
            onValueChange={(v) => onChange({ icon: v as Block['icon'] })}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="download">Download</SelectItem>
              <SelectItem value="external">External</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Align</Label>
          <Select
            value={block.align ?? 'left'}
            onValueChange={(v) => onChange({ align: v as Block['align'] })}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between border rounded px-2 py-1.5">
          <Label className="text-xs">New tab</Label>
          <Switch
            checked={block.openInNewTab ?? true}
            onCheckedChange={(v) => onChange({ openInNewTab: v })}
          />
        </div>
      </div>
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

const VARIANT_STYLE: Record<string, React.CSSProperties> = {
  primary: {
    backgroundColor: '#BC0D2A',
    color: '#ffffff',
    border: '1px solid #BC0D2A',
  },
  outline: {
    backgroundColor: 'transparent',
    color: '#0f172a',
    border: '1.5px solid #0f172a',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: '#BC0D2A',
    border: '1px solid transparent',
  },
};

export function DownloadButtonPreview({ block }: { block: Block }) {
  const label = block.label ?? 'Download';
  const url = useBoundValue(block.urlFieldKey, block.url) ?? '';
  const icon = block.icon ?? 'download';
  const variant = block.variant ?? 'primary';
  const align = block.align ?? 'left';
  const openInNewTab = block.openInNewTab ?? true;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
  };

  const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    borderRadius: '9999px',
    textDecoration: 'none',
    cursor: url ? 'pointer' : 'not-allowed',
    opacity: url ? 1 : 0.5,
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    ...VARIANT_STYLE[variant],
  };

  const IconEl =
    icon === 'download' ? <ArrowDownToLine size={16} /> :
    icon === 'external' ? <ExternalLink size={16} /> : null;

  return (
    <div style={containerStyle}>
      <a
        href={url || undefined}
        target={openInNewTab ? '_blank' : undefined}
        rel={openInNewTab ? 'noopener noreferrer' : undefined}
        download={icon === 'download' ? '' : undefined}
        style={buttonStyle}
      >
        {label}
        {IconEl}
      </a>
    </div>
  );
}
