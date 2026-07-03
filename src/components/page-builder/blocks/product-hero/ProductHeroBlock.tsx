'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { type ProductHeroBlockData } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AssetPicker } from '../../AssetPicker';
import { X, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { useCollectionItem } from '@/contexts/CollectionItemContext';
import { useRepeaterEntry } from '@/contexts/RepeaterEntryContext';
import { useMockCollectionEntry } from '@/contexts/MockCollectionEntryContext';
import { useEffect, useState } from 'react';

type Block = ProductHeroBlockData;

// ── Editor ────────────────────────────────────────────────────────────────

function BodyEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit.configure({ link: false }), Link.configure({ openOnClick: false, autolink: true })],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none p-2 min-h-[80px] focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  return (
    <div className="border rounded-md bg-background">
      <EditorContent editor={editor} />
    </div>
  );
}

export function ProductHeroEditor({
  block,
  onChange,
}: {
  block: Block;
  onChange: (updates: Partial<Block>) => void;
}) {
  const imagePos = block.imagePosition ?? 'right';
  const imageOnRight = imagePos === 'right';

  const imageBox = (
    <div className="space-y-1.5">
      <Label className="text-xs">Image</Label>
      {block.image ? (
        <div className="relative aspect-square w-full rounded-md overflow-hidden border bg-muted group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.image} alt="" className="w-full h-full object-contain bg-white" />
          <div className="absolute top-2 right-2 flex gap-2">
            <AssetPicker
              onSelect={(url) => onChange({ image: url })}
              trigger={
                <Button size="sm" variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  Change
                </Button>
              }
            />
            <Button
              size="icon"
              variant="destructive"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onChange({ image: '' })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="aspect-square border-2 border-dashed rounded-md flex flex-col items-center justify-center gap-2 text-muted-foreground bg-muted/20">
          <ImageIcon className="h-8 w-8 opacity-50" />
          <AssetPicker onSelect={(url) => onChange({ image: url })} />
        </div>
      )}
    </div>
  );

  const textCol = (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Subtitle (small)</Label>
        <Input
          value={block.subtitle1 ?? ''}
          onChange={(e) => onChange({ subtitle1: e.target.value })}
          placeholder="NEW ARRIVAL"
          className="text-xs uppercase tracking-widest font-bold"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Title</Label>
        <Input
          value={block.title ?? ''}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Product name"
          className="text-lg font-bold"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Subtitle 2</Label>
        <Input
          value={block.subtitle2 ?? ''}
          onChange={(e) => onChange({ subtitle2: e.target.value })}
          placeholder="Category or tagline"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Body</Label>
        <BodyEditor value={block.body ?? ''} onChange={(html) => onChange({ body: html })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">CTA Label</Label>
          <Input
            value={block.ctaLabel ?? ''}
            onChange={(e) => onChange({ ctaLabel: e.target.value })}
            placeholder="Discover"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">CTA URL</Label>
          <Input
            value={block.ctaUrl ?? ''}
            onChange={(e) => onChange({ ctaUrl: e.target.value })}
            placeholder="/contact"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 border rounded-md space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Two-column product showcase.</p>
        <div className="flex items-center gap-2">
          <Label className="text-xs">Image on</Label>
          <Select
            value={imagePos}
            onValueChange={(v) => onChange({ imagePosition: v as 'left' | 'right' })}
          >
            <SelectTrigger className="h-7 text-xs w-24"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {imageOnRight ? (
          <>
            {textCol}
            {imageBox}
          </>
        ) : (
          <>
            {imageBox}
            {textCol}
          </>
        )}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Background Color</Label>
        <div className="flex gap-2">
          <Input
            value={block.backgroundColor ?? ''}
            onChange={(e) => onChange({ backgroundColor: e.target.value })}
            placeholder="#ffffff or transparent"
            className="h-8 text-xs font-mono flex-1"
          />
          {block.backgroundColor && (
            <div
              className="h-8 w-8 rounded border shrink-0"
              style={{ backgroundColor: block.backgroundColor }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Preview ───────────────────────────────────────────────────────────────

// Resolves a prop's live value: prefer bound field key (if set + resolvable),
// otherwise fall back to the literal value in block data.
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
    // Fall through to literal if binding unresolvable (e.g. no context)
  }

  return literal;
}

export function ProductHeroPreview({ block }: { block: Block }) {
  const title = useBoundValue(block.titleFieldKey, block.title);
  const subtitle1 = useBoundValue(block.subtitle1FieldKey, block.subtitle1);
  const subtitle2 = useBoundValue(block.subtitle2FieldKey, block.subtitle2);
  const body = useBoundValue(block.bodyFieldKey, block.body);
  const image = useBoundValue(block.imageFieldKey, block.image);
  const imagePos = block.imagePosition ?? 'right';
  const imageOnRight = imagePos === 'right';
  const bg = block.backgroundColor;

  const wrapperStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '2.5rem',
    alignItems: 'center',
    padding: '2rem 0',
  };

  const imageColStyle: React.CSSProperties = {
    order: imageOnRight ? 2 : 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '320px',
  };

  const textColStyle: React.CSSProperties = {
    order: imageOnRight ? 1 : 2,
  };

  const imgStyle: React.CSSProperties = {
    maxWidth: '100%',
    maxHeight: '480px',
    width: '100%',
    height: 'auto',
    objectFit: 'contain',
    display: 'block',
  };

  const subtitle1Style: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    color: '#BC0D2A',
    marginBottom: '0.75rem',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '2.5rem',
    fontWeight: 800,
    lineHeight: 1.1,
    color: '#0f172a',
    margin: '0 0 0.5rem 0',
    letterSpacing: '-0.02em',
  };

  const subtitle2Style: React.CSSProperties = {
    fontSize: '1rem',
    fontWeight: 500,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    margin: '0 0 1.25rem 0',
  };

  const bodyStyle: React.CSSProperties = {
    fontSize: '1rem',
    lineHeight: 1.7,
    color: '#334155',
    marginBottom: '1.75rem',
  };

  const ctaStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    borderRadius: '9999px',
    backgroundColor: '#BC0D2A',
    color: '#ffffff',
    fontSize: '0.875rem',
    fontWeight: 600,
    textDecoration: 'none',
    transition: 'background-color 0.15s ease',
  };

  const responsiveCss = `
    @media (max-width: 767.98px) {
      [data-product-hero="${block.title ?? ''}"] .product-hero-grid {
        grid-template-columns: 1fr !important;
        gap: 1.5rem !important;
      }
      [data-product-hero="${block.title ?? ''}"] .product-hero-image {
        order: 0 !important;
        min-height: 240px !important;
      }
      [data-product-hero="${block.title ?? ''}"] .product-hero-text {
        order: 1 !important;
      }
      [data-product-hero="${block.title ?? ''}"] .product-hero-title {
        font-size: 1.875rem !important;
      }
    }
    @container preview (max-width: 767.98px) {
      [data-product-hero="${block.title ?? ''}"] .product-hero-grid {
        grid-template-columns: 1fr !important;
        gap: 1.5rem !important;
      }
      [data-product-hero="${block.title ?? ''}"] .product-hero-image {
        order: 0 !important;
        min-height: 240px !important;
      }
      [data-product-hero="${block.title ?? ''}"] .product-hero-text {
        order: 1 !important;
      }
      [data-product-hero="${block.title ?? ''}"] .product-hero-title {
        font-size: 1.875rem !important;
      }
    }
  `;

  return (
    <div
      data-product-hero={block.title ?? ''}
      style={bg ? { backgroundColor: bg, borderRadius: '12px', padding: '2rem' } : undefined}
    >
      <style dangerouslySetInnerHTML={{ __html: responsiveCss }} />
      <div className="product-hero-grid" style={wrapperStyle}>
        <div className="product-hero-image" style={imageColStyle}>
          {image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={image} alt={title ?? ''} style={imgStyle} />
          ) : (
            <div
              style={{
                width: '100%',
                minHeight: '320px',
                border: '2px dashed #cbd5e1',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                fontSize: '0.875rem',
              }}
            >
              No image
            </div>
          )}
        </div>
        <div className="product-hero-text" style={textColStyle}>
          {subtitle1 && <div style={subtitle1Style}>{subtitle1}</div>}
          {title && <h1 className="product-hero-title" style={titleStyle}>{title}</h1>}
          {subtitle2 && <p style={subtitle2Style}>{subtitle2}</p>}
          {body && (
            <div
              style={bodyStyle}
              dangerouslySetInnerHTML={{ __html: body }}
            />
          )}
          {block.ctaLabel && (
            <a href={block.ctaUrl || '#'} style={ctaStyle}>
              {block.ctaLabel}
              <ArrowRight size={16} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
