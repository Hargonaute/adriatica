'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { type BlockData, type PageData, type CollectionField, type FieldType } from '@/types';
import { useTemplateBuilderStore } from '@/lib/store/templateBuilderStore';
import { BLOCKS_REGISTRY } from './blocks/registry';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

// Sensible UI fallbacks for fields that aren't part of any block's createDefault().
// These keep the inspector's controls from showing an empty/un-selected state when
// the user has never touched them. Saved values in selectedBlock.data always win.
const INSPECTOR_FALLBACKS = {
  paddingTop: 'md',
  paddingBottom: 'md',
  align: 'left',
  maxWidth: 'full',
  background: 'none',
  fontSize: 'base',
  fontWeight: 'normal',
  textColor: '',
  borderWidth: '0',
  borderRadius: 'none',
  borderColor: '',
  gap: 'none',
  gridColumns: '1',
  aspectRatio: 'auto',
  customClassName: '',
  // Container
  direction: 'column',
  layout: 'stack',
  mobileBehavior: 'stack',
  containerGap: 'none',
  containerPadding: 'none',
  alignItems: 'stretch',
  backgroundColor: '',
  // Repeater
  columns: '3',
  repeaterGap: 'md',
  // Bound Image / Image
  objectFit: 'cover',
  width: 'full',
  // Bound Text
  textTransform: 'none',
  as: 'p',
  // Spacer
  size: 'md',
  showDivider: false,
  dividerColor: '',
  dividerStyle: 'solid',
} as const;

// Field types each bound block accepts
const BOUND_FIELD_TYPES: Record<string, FieldType[]> = {
  'bound-text':      ['text', 'number', 'email', 'textarea'],
  'bound-image':     ['image'],
  'bound-rich-text': ['rich-text'],
  'bound-date':      ['date'],
};

// Composite blocks expose multiple bindable props. Each entry maps a data key
// (e.g. `titleFieldKey`) to a human label and the set of field types the picker
// should allow. Rendered by CompositeBindingSection in template mode.
type CompositeBinding = {
  key: string;
  label: string;
  allowed: FieldType[];
};

const COMPOSITE_BINDINGS: Record<string, CompositeBinding[]> = {
  'product-hero': [
    { key: 'titleFieldKey',     label: 'Title',     allowed: ['text'] },
    { key: 'subtitle1FieldKey', label: 'Subtitle (small)', allowed: ['text'] },
    { key: 'subtitle2FieldKey', label: 'Subtitle 2', allowed: ['text'] },
    { key: 'bodyFieldKey',      label: 'Body',      allowed: ['textarea', 'rich-text'] },
    { key: 'imageFieldKey',     label: 'Image',     allowed: ['image'] },
  ],
  'section-heading': [
    { key: 'headingFieldKey',    label: 'Heading',    allowed: ['text'] },
    { key: 'subheadingFieldKey', label: 'Subheading', allowed: ['text', 'textarea'] },
  ],
  'download-button': [
    { key: 'urlFieldKey', label: 'File URL', allowed: ['text', 'image'] },
  ],
};

interface InspectorProps {
  selectedBlock: { id: string; type: string; data: BlockData } | null;
  onChange: (id: string, data: Partial<BlockData>) => void;
  pageData: PageData;
  onPageChange: (updates: Partial<PageData>) => void;
  mode?: 'static' | 'template';
  /**
   * Set by Editor.tsx when the selected block lives inside a Repeater's
   * cardTemplate. The Inspector treats this as template-mode and binds against
   * the Repeater's own collectionId rather than the template-builder store.
   */
  repeaterContext?: { collectionId: string | null } | null;
}

// Bound-block alternatives for plain blocks added inside a Repeater. Used to
// nudge the user toward a bindable variant when they pick the static block.
const BOUND_ALTERNATIVE: Record<string, string> = {
  'image': 'Bound Image',
  'rich-text': 'Bound Rich Text',
};

// ── Page-level SEO panel ───────────────────────────────────────────────────

function PageSettingsPanel({
  pageData,
  onPageChange,
}: {
  pageData: PageData;
  onPageChange: (updates: Partial<PageData>) => void;
}) {
  const meta = pageData.meta ?? {};

  const setMeta = (key: string, value: string | boolean) => {
    onPageChange({ meta: { ...meta, [key]: value } });
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="font-semibold tracking-tight">Page Settings</h3>
        <p className="text-xs text-muted-foreground mt-0.5">SEO &amp; metadata</p>
      </div>

      {/* Basic */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">General</h4>

        <div className="space-y-1.5">
          <Label className="text-xs">Page Title</Label>
          <Input
            value={pageData.title}
            onChange={(e) => onPageChange({ title: e.target.value })}
            placeholder="My Landing Page"
            className="h-8 text-sm"
          />
          <p className="text-xs text-muted-foreground">Used as the default for the browser tab and og:title.</p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Slug</Label>
          <Input
            value={pageData.slug}
            disabled
            className="h-8 text-sm font-mono bg-muted"
          />
          <p className="text-xs text-muted-foreground">Change the slug from the pages list.</p>
        </div>
      </div>

      <Separator />

      {/* SEO overrides */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">SEO</h4>

        <div className="space-y-1.5">
          <Label className="text-xs">Meta Title <span className="text-muted-foreground">(override)</span></Label>
          <Input
            value={meta.title ?? ''}
            onChange={(e) => setMeta('title', e.target.value)}
            placeholder="Falls back to Page Title"
            className="h-8 text-sm"
            maxLength={60}
          />
          <p className="text-xs text-muted-foreground">{(meta.title ?? '').length}/60 chars</p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Meta Description</Label>
          <Textarea
            value={meta.description ?? ''}
            onChange={(e) => setMeta('description', e.target.value)}
            placeholder="A short summary of the page (120–160 chars recommended)"
            className="text-sm resize-none"
            rows={3}
            maxLength={160}
          />
          <p className="text-xs text-muted-foreground">{(meta.description ?? '').length}/160 chars</p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Canonical URL <span className="text-muted-foreground">(optional override)</span></Label>
          <Input
            value={meta.canonical ?? ''}
            onChange={(e) => setMeta('canonical', e.target.value)}
            placeholder="https://example.com/my-page"
            className="h-8 text-sm"
          />
          <p className="text-xs text-muted-foreground">Leave blank to auto-generate from slug.</p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">No Index</Label>
            <p className="text-xs text-muted-foreground">Hide from search engines</p>
          </div>
          <Switch
            checked={!!meta.noIndex}
            onCheckedChange={(v) => setMeta('noIndex', v)}
          />
        </div>
      </div>

      <Separator />

      {/* Open Graph / Social */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Social / Open Graph</h4>

        <div className="space-y-1.5">
          <Label className="text-xs">OG Image URL</Label>
          <Input
            value={meta.ogImage ?? ''}
            onChange={(e) => setMeta('ogImage', e.target.value)}
            placeholder="https://example.com/og.png (1200×630)"
            className="h-8 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Recommended: 1200×630 px. Used for Twitter card, Facebook, LinkedIn etc.
          </p>
        </div>

        {meta.ogImage && (
          <div className="rounded-md overflow-hidden border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={meta.ogImage}
              alt="OG preview"
              className="w-full h-auto object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Spacer-specific controls ──────────────────────────────────────────────

function SpacerSection({
  data,
  onChange,
}: {
  data: BlockData;
  onChange: (key: keyof BlockData, value: unknown) => void;
}) {
  // `size` supersedes legacy `height` — read either so old blocks stay sane.
  const currentSize = (data as any).size ?? (data as any).height ?? 'md';
  const showDivider = !!(data as any).showDivider;

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Spacer</h4>

      <div className="space-y-1.5">
        <Label className="text-xs">Size</Label>
        <Select
          value={currentSize}
          onValueChange={(v) => onChange('size' as keyof BlockData, v)}
        >
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="xs">XS — 8px</SelectItem>
            <SelectItem value="sm">SM — 16px</SelectItem>
            <SelectItem value="md">MD — 32px</SelectItem>
            <SelectItem value="lg">LG — 64px</SelectItem>
            <SelectItem value="xl">XL — 96px</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-xs">Show Divider</Label>
        <Switch
          checked={showDivider}
          onCheckedChange={(v) => onChange('showDivider' as keyof BlockData, v)}
        />
      </div>

      {showDivider && (
        <>
          <div className="space-y-1.5">
            <Label className="text-xs">Divider Color</Label>
            <div className="flex gap-2">
              <Input
                value={(data as any).dividerColor ?? ''}
                onChange={(e) => onChange('dividerColor' as keyof BlockData, e.target.value)}
                placeholder="rgba(0,0,0,0.2)"
                className="h-8 text-xs font-mono flex-1"
              />
              {(data as any).dividerColor && (
                <div
                  className="h-8 w-8 rounded border shrink-0"
                  style={{ backgroundColor: (data as any).dividerColor }}
                />
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">Leave blank for currentColor at 20% opacity.</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Divider Style</Label>
            <Select
              value={(data as any).dividerStyle ?? 'solid'}
              onValueChange={(v) => onChange('dividerStyle' as keyof BlockData, v)}
            >
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="dashed">Dashed</SelectItem>
                <SelectItem value="dotted">Dotted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  );
}

// ── Repeater-specific controls ─────────────────────────────────────────────

function RepeaterSection({
  data,
  onChange,
}: {
  data: BlockData;
  onChange: (key: keyof BlockData, value: unknown) => void;
}) {
  const [collections, setCollections] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/collections')
      .then((r) => r.json())
      .then((data) => setCollections(Array.isArray(data) ? data : []))
      .catch(() => setCollections([]))
      .finally(() => setLoading(false));
  }, []);

  const currentCollectionId = (data as any).collectionId ?? '__none__';

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Repeater</h4>

      <div className="space-y-1.5">
        <Label className="text-xs">Collection</Label>
        {loading ? (
          <p className="text-xs text-muted-foreground">Loading collections…</p>
        ) : (
          <Select
            value={currentCollectionId}
            onValueChange={(v) => {
              if (v === '__none__') {
                onChange('collectionId' as keyof BlockData, undefined);
                onChange('collectionSlug' as keyof BlockData, undefined);
              } else {
                const col = collections.find((c) => c.id === v);
                onChange('collectionId' as keyof BlockData, v);
                if (col) onChange('collectionSlug' as keyof BlockData, col.slug);
              }
            }}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">— None —</SelectItem>
              {collections.map((col) => (
                <SelectItem key={col.id} value={col.id}>{col.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Columns</Label>
          <Select
            value={(data as any).columns ?? '3'}
            onValueChange={(v) => onChange('columns' as keyof BlockData, v)}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Gap</Label>
          <Select
            value={(data as any).repeaterGap ?? 'md'}
            onValueChange={(v) => onChange('repeaterGap' as keyof BlockData, v)}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

// ── Container-specific controls ────────────────────────────────────────────

function ContainerLayoutSection({
  data,
  onChange,
}: {
  data: BlockData;
  onChange: (key: keyof BlockData, value: unknown) => void;
}) {
  const layout = (data as any).layout ?? 'stack';
  return (
    <div className="space-y-4">
      <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Container</h4>

      <div className="space-y-1.5">
        <Label className="text-xs">Layout</Label>
        <Select
          value={layout}
          onValueChange={(v) => onChange('layout' as keyof BlockData, v)}
        >
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="stack">Stack (single column)</SelectItem>
            <SelectItem value="two-col-text-image">Two columns — text · image</SelectItem>
            <SelectItem value="two-col-image-text">Two columns — image · text</SelectItem>
            <SelectItem value="three-col">Three columns</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Mobile behavior</Label>
        <Select
          value={(data as any).mobileBehavior ?? 'stack'}
          onValueChange={(v) => onChange('mobileBehavior' as keyof BlockData, v)}
        >
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="stack">Stack (single column)</SelectItem>
            <SelectItem value="same">Same as desktop</SelectItem>
            <SelectItem value="hide">Hide on mobile</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Direction only meaningful when layout === 'stack' */}
      {layout === 'stack' && (
        <div className="space-y-1.5">
          <Label className="text-xs">Direction</Label>
          <Select
            value={(data as any).direction ?? 'column'}
            onValueChange={(v) => onChange('direction' as keyof BlockData, v)}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="column">Column (stacked)</SelectItem>
              <SelectItem value="row">Row (side by side)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Inner Gap</Label>
          <Select
            value={(data as any).containerGap ?? 'none'}
            onValueChange={(v) => onChange('containerGap' as keyof BlockData, v)}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Inner Padding</Label>
          <Select
            value={(data as any).containerPadding ?? 'none'}
            onValueChange={(v) => onChange('containerPadding' as keyof BlockData, v)}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Align Items</Label>
        <Select
          value={(data as any).alignItems ?? 'stretch'}
          onValueChange={(v) => onChange('alignItems' as keyof BlockData, v)}
        >
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="stretch">Stretch (fill)</SelectItem>
            <SelectItem value="start">Start (top / left)</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="end">End (bottom / right)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Background Color</Label>
        <div className="flex gap-2">
          <Input
            value={(data as any).backgroundColor ?? ''}
            onChange={(e) => onChange('backgroundColor' as keyof BlockData, e.target.value)}
            placeholder="#ffffff or transparent"
            className="h-8 text-xs font-mono flex-1"
          />
          {(data as any).backgroundColor && (
            <div
              className="h-8 w-8 rounded border shrink-0"
              style={{ backgroundColor: (data as any).backgroundColor }}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Border Width</Label>
          <Select
            value={(data as any).borderWidth ?? '0'}
            onValueChange={(v) => onChange('borderWidth' as keyof BlockData, v)}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="0">None</SelectItem>
              <SelectItem value="1">1px</SelectItem>
              <SelectItem value="2">2px</SelectItem>
              <SelectItem value="4">4px</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Border Radius</Label>
          <Select
            value={(data as any).borderRadius ?? 'none'}
            onValueChange={(v) => onChange('borderRadius' as keyof BlockData, v)}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
              <SelectItem value="full">Full</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {(data as any).borderWidth && (data as any).borderWidth !== '0' && (
        <div className="space-y-1.5">
          <Label className="text-xs">Border Color</Label>
          <div className="flex gap-2">
            <Input
              value={(data as any).borderColor ?? ''}
              onChange={(e) => onChange('borderColor' as keyof BlockData, e.target.value)}
              placeholder="#e2e8f0"
              className="h-8 text-xs font-mono flex-1"
            />
            {(data as any).borderColor && (
              <div
                className="h-8 w-8 rounded border shrink-0"
                style={{ backgroundColor: (data as any).borderColor }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared sizing controls (image + bound-image) ───────────────────────────

function ImageSizingSection({
  data,
  onChange,
}: {
  data: BlockData;
  onChange: (key: keyof BlockData, value: unknown) => void;
}) {
  return (
    <div className="space-y-4">
      <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Image</h4>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Aspect Ratio</Label>
          <Select
            value={(data as any).aspectRatio ?? 'auto'}
            onValueChange={(v) => onChange('aspectRatio' as keyof BlockData, v)}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="1:1">1:1</SelectItem>
              <SelectItem value="4:3">4:3</SelectItem>
              <SelectItem value="16:9">16:9</SelectItem>
              <SelectItem value="3:4">3:4</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Object Fit</Label>
          <Select
            value={(data as any).objectFit ?? 'cover'}
            onValueChange={(v) => onChange('objectFit' as keyof BlockData, v)}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cover">Cover</SelectItem>
              <SelectItem value="contain">Contain</SelectItem>
              <SelectItem value="fill">Fill</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Width</Label>
          <Select
            value={(data as any).width ?? 'full'}
            onValueChange={(v) => onChange('width' as keyof BlockData, v)}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full</SelectItem>
              <SelectItem value="half">Half</SelectItem>
              <SelectItem value="third">Third</SelectItem>
              <SelectItem value="auto">Auto</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Border Radius</Label>
          <Select
            value={(data as any).borderRadius ?? 'none'}
            onValueChange={(v) => onChange('borderRadius' as keyof BlockData, v)}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="sm">Small (4px)</SelectItem>
              <SelectItem value="md">Medium (8px)</SelectItem>
              <SelectItem value="lg">Large (16px)</SelectItem>
              <SelectItem value="full">Full (9999px)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-xs">Hide on Mobile</Label>
        <Switch
          checked={!!(data as any).hideOnMobile}
          onCheckedChange={(v) => onChange('hideOnMobile' as keyof BlockData, v)}
        />
      </div>
    </div>
  );
}

// ── Bound Text typography controls ─────────────────────────────────────────

function BoundTextTypographySection({
  data,
  onChange,
  includeAs = false,
}: {
  data: BlockData;
  onChange: (key: keyof BlockData, value: unknown) => void;
  /** When true, exposes the HTML tag selector (Bound Text only, not Bound Rich Text). */
  includeAs?: boolean;
}) {
  return (
    <div className="space-y-4">
      <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Typography</h4>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Font Size</Label>
          <Select
            value={(data as any).fontSize ?? 'base'}
            onValueChange={(v) => onChange('fontSize' as keyof BlockData, v)}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="xs">XS (12px)</SelectItem>
              <SelectItem value="sm">SM (14px)</SelectItem>
              <SelectItem value="base">Base (16px)</SelectItem>
              <SelectItem value="lg">LG (18px)</SelectItem>
              <SelectItem value="xl">XL (20px)</SelectItem>
              <SelectItem value="2xl">2XL (24px)</SelectItem>
              <SelectItem value="3xl">3XL (30px)</SelectItem>
              <SelectItem value="4xl">4XL (36px)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Font Weight</Label>
          <Select
            value={(data as any).fontWeight ?? 'normal'}
            onValueChange={(v) => onChange('fontWeight' as keyof BlockData, v)}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal (400)</SelectItem>
              <SelectItem value="medium">Medium (500)</SelectItem>
              <SelectItem value="semibold">Semibold (600)</SelectItem>
              <SelectItem value="bold">Bold (700)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Color</Label>
        <Input
          value={(data as any).textColor ?? ''}
          onChange={(e) => onChange('textColor' as keyof BlockData, e.target.value)}
          placeholder="#1a1a1a or var(--foreground)"
          className="h-8 text-xs font-mono"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Text Transform</Label>
        <Select
          value={(data as any).textTransform ?? 'none'}
          onValueChange={(v) => onChange('textTransform' as keyof BlockData, v)}
        >
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="uppercase">Uppercase</SelectItem>
            <SelectItem value="lowercase">Lowercase</SelectItem>
            <SelectItem value="capitalize">Capitalize</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {includeAs && (
        <div className="space-y-1.5">
          <Label className="text-xs">Render As</Label>
          <Select
            value={(data as any).as ?? 'p'}
            onValueChange={(v) => onChange('as' as keyof BlockData, v)}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="p">Paragraph (p)</SelectItem>
              <SelectItem value="h1">Heading 1 (h1)</SelectItem>
              <SelectItem value="h2">Heading 2 (h2)</SelectItem>
              <SelectItem value="h3">Heading 3 (h3)</SelectItem>
              <SelectItem value="h4">Heading 4 (h4)</SelectItem>
              <SelectItem value="span">Inline (span)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

// ── Block-level Inspector panel ────────────────────────────────────────────

function FieldBindingSection({
  blockId,
  blockType,
  fieldKey,
  onChange,
  collectionIdOverride,
}: {
  blockId: string;
  blockType: string;
  fieldKey: string | null;
  onChange: (id: string, data: Partial<BlockData>) => void;
  /** When set, takes precedence over the template-builder store's collectionId
   * (e.g. for blocks inside a Repeater on a non-template page). */
  collectionIdOverride?: string | null;
}) {
  const storeCollectionId = useTemplateBuilderStore((s) => s.collectionId);
  const contextCollectionId = collectionIdOverride ?? storeCollectionId;

  // When no collection context is available (edge case: bound block used
  // outside a template / repeater), let the user pick any collection manually.
  const [manualCollectionId, setManualCollectionId] = useState<string | null>(null);
  const [allCollections, setAllCollections] = useState<Array<{ id: string; name: string }>>([]);
  const collectionId = contextCollectionId ?? manualCollectionId;
  const showCollectionPicker = !contextCollectionId;

  const [fields, setFields] = useState<CollectionField[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!showCollectionPicker) return;
    fetch('/api/collections')
      .then((r) => r.json())
      .then((data) => setAllCollections(Array.isArray(data) ? data : []))
      .catch(() => setAllCollections([]));
  }, [showCollectionPicker]);

  useEffect(() => {
    if (!collectionId) { setFields([]); return; }
    setLoading(true);
    fetch(`/api/collections/${collectionId}`)
      .then((r) => r.json())
      .then((col) => setFields(col.fields ?? []))
      .catch(() => setFields([]))
      .finally(() => setLoading(false));
  }, [collectionId]);

  const allowedTypes = BOUND_FIELD_TYPES[blockType] ?? [];
  const filtered = fields.filter((f) => allowedTypes.includes(f.type as FieldType));

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Field Binding</h4>

      {showCollectionPicker && (
        <div className="space-y-1.5">
          <Label className="text-xs">Collection</Label>
          <Select
            value={manualCollectionId ?? '__none__'}
            onValueChange={(v) => setManualCollectionId(v === '__none__' ? null : v)}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Pick a collection" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">— None —</SelectItem>
              {allCollections.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground">
            No template collection detected — pick one to browse its fields.
          </p>
        </div>
      )}

      {!collectionId ? (
        !showCollectionPicker && (
          <p className="text-xs text-muted-foreground">No collection set for this template.</p>
        )
      ) : loading ? (
        <p className="text-xs text-muted-foreground">Loading fields…</p>
      ) : filtered.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No compatible fields in this collection.
        </p>
      ) : (
        <div className="space-y-1.5">
          <Label className="text-xs">Bound Field</Label>
          <Select
            value={fieldKey ?? '__none__'}
            onValueChange={(v) => onChange(blockId, { fieldKey: v === '__none__' ? null : v } as Partial<BlockData>)}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">— None —</SelectItem>
              {filtered.map((f) => (
                <SelectItem key={f.id} value={f.key}>
                  {f.label} <span className="text-muted-foreground ml-1">({f.type})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

// Per-prop field bindings for composite blocks (Product Hero, Section Heading,
// Download Button). Loads the collection's fields and lets the user pick which
// field feeds each bindable prop. Only shown in template mode / repeater context.
function CompositeBindingSection({
  blockId,
  blockType,
  data,
  onChange,
  collectionIdOverride,
}: {
  blockId: string;
  blockType: string;
  data: Record<string, any>;
  onChange: (id: string, updates: Partial<BlockData>) => void;
  collectionIdOverride?: string | null;
}) {
  const storeCollectionId = useTemplateBuilderStore((s) => s.collectionId);
  const contextCollectionId = collectionIdOverride ?? storeCollectionId;

  // Fallback manual picker when the page isn't wired as a template in the DB
  const [manualCollectionId, setManualCollectionId] = useState<string | null>(null);
  const [allCollections, setAllCollections] = useState<Array<{ id: string; name: string }>>([]);
  const collectionId = contextCollectionId ?? manualCollectionId;
  const showCollectionPicker = !contextCollectionId;

  const [fields, setFields] = useState<CollectionField[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!showCollectionPicker) return;
    fetch('/api/collections')
      .then((r) => r.json())
      .then((data) => setAllCollections(Array.isArray(data) ? data : []))
      .catch(() => setAllCollections([]));
  }, [showCollectionPicker]);

  useEffect(() => {
    if (!collectionId) { setFields([]); return; }
    setLoading(true);
    fetch(`/api/collections/${collectionId}`)
      .then((r) => r.json())
      .then((col) => setFields(col.fields ?? []))
      .catch(() => setFields([]))
      .finally(() => setLoading(false));
  }, [collectionId]);

  const bindings = COMPOSITE_BINDINGS[blockType] ?? [];
  if (bindings.length === 0) return null;

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Field Bindings</h4>

      {showCollectionPicker && (
        <div className="space-y-1.5">
          <Label className="text-xs">Collection</Label>
          <Select
            value={manualCollectionId ?? '__none__'}
            onValueChange={(v) => setManualCollectionId(v === '__none__' ? null : v)}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Pick a collection" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">— None —</SelectItem>
              {allCollections.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground">
            No template collection detected — pick one to browse its fields.
          </p>
        </div>
      )}

      {!collectionId ? null : loading ? (
        <p className="text-xs text-muted-foreground">Loading fields…</p>
      ) : (
        <div className="space-y-3">
          {bindings.map((b) => {
            const allowed = fields.filter((f) => b.allowed.includes(f.type as FieldType));
            const value = (data[b.key] ?? null) as string | null;
            return (
              <div key={b.key} className="space-y-1.5">
                <Label className="text-xs">{b.label}</Label>
                <Select
                  value={value ?? '__none__'}
                  onValueChange={(v) => onChange(blockId, { [b.key]: v === '__none__' ? null : v } as Partial<BlockData>)}
                >
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— None (use literal) —</SelectItem>
                    {allowed.map((f) => (
                      <SelectItem key={f.id} value={f.key}>
                        {f.label} <span className="text-muted-foreground ml-1">({f.type})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BlockInspectorPanel({
  selectedBlock,
  onChange,
  mode = 'static',
  repeaterContext,
}: {
  selectedBlock: { id: string; type: string; data: BlockData };
  onChange: (id: string, data: Partial<BlockData>) => void;
  mode?: 'static' | 'template';
  repeaterContext?: { collectionId: string | null } | null;
}) {
  const isBoundBlock = selectedBlock.type in BOUND_FIELD_TYPES;
  // A block inside a Repeater's cardTemplate gets template-mode UI even on a
  // static page, so the user can bind it to a field on the Repeater's collection.
  const effectiveMode: 'static' | 'template' = repeaterContext ? 'template' : mode;
  const boundAlternative = repeaterContext ? BOUND_ALTERNATIVE[selectedBlock.type] : undefined;

  // Restore every controlled input's value from the block's saved data on each
  // selection change. Order: hardcoded UI fallbacks → registry createDefault() →
  // saved selectedBlock.data. The saved data always wins; missing keys fall back
  // to registry defaults, and finally to UI fallbacks so no input is ever
  // un-selected/empty when its value is unset.
  const effectiveData = useMemo(() => {
    const registry = BLOCKS_REGISTRY[selectedBlock.type];
    const registryDefaults = registry?.createDefault ? registry.createDefault() : {};
    return {
      ...INSPECTOR_FALLBACKS,
      ...(registryDefaults as Record<string, unknown>),
      ...(selectedBlock.data as Record<string, unknown>),
    } as Record<string, any>;
  }, [selectedBlock.id, selectedBlock.type, selectedBlock.data]);

  const data = effectiveData;

  const handleChange = (key: keyof BlockData, value: unknown) => {
    onChange(selectedBlock.id, { [key]: value });
  };

  const isContainer = selectedBlock.type === 'container';
  const isRepeater = selectedBlock.type === 'repeater';
  const isSpacer = selectedBlock.type === 'spacer';
  const isImage = selectedBlock.type === 'image' || selectedBlock.type === 'bound-image';
  const isBoundText = selectedBlock.type === 'bound-text';
  const isBoundRichText = selectedBlock.type === 'bound-rich-text';
  const isComposite = selectedBlock.type in COMPOSITE_BINDINGS;

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="font-semibold tracking-tight">Inspector</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Editing {selectedBlock.type}</p>
      </div>

      {/* Spacer-specific controls */}
      {isSpacer && (
        <>
          <SpacerSection data={data as BlockData} onChange={handleChange} />
          <Separator />
        </>
      )}

      {/* Repeater-specific controls */}
      {isRepeater && (
        <>
          <RepeaterSection data={data as BlockData} onChange={handleChange} />
          <Separator />
        </>
      )}

      {/* Container-specific controls */}
      {isContainer && (
        <>
          <ContainerLayoutSection data={data as BlockData} onChange={handleChange} />
          <Separator />
        </>
      )}

      {/* Image sizing (regular + bound) */}
      {isImage && (
        <>
          <ImageSizingSection data={data as BlockData} onChange={handleChange} />
          <Separator />
        </>
      )}

      {/* Bound Text / Bound Rich Text typography */}
      {(isBoundText || isBoundRichText) && (
        <>
          <BoundTextTypographySection
            data={data as BlockData}
            onChange={handleChange}
            includeAs={isBoundText}
          />
          <Separator />
        </>
      )}

      {/* Field binding — template mode (or inside a Repeater), bound blocks only */}
      {effectiveMode === 'template' && isBoundBlock && (
        <>
          <FieldBindingSection
            blockId={selectedBlock.id}
            blockType={selectedBlock.type}
            fieldKey={(data as { fieldKey?: string | null }).fieldKey ?? null}
            onChange={onChange}
            collectionIdOverride={repeaterContext?.collectionId ?? null}
          />
          <Separator />
        </>
      )}

      {/* Field bindings — composite blocks in template mode */}
      {effectiveMode === 'template' && isComposite && (
        <>
          <CompositeBindingSection
            blockId={selectedBlock.id}
            blockType={selectedBlock.type}
            data={data}
            onChange={onChange}
            collectionIdOverride={repeaterContext?.collectionId ?? null}
          />
          <Separator />
        </>
      )}

      {/* Hint: plain block inside a Repeater — suggest the bound equivalent */}
      {repeaterContext && boundAlternative && (
        <>
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            This block won't change per entry. Use <strong>{boundAlternative}</strong> to bind it to a collection field.
          </div>
          <Separator />
        </>
      )}

      {/* Layout */}
      <div className="space-y-4">
        <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Layout</h4>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Padding Top</Label>
            <Select value={data.paddingTop ?? 'md'} onValueChange={(v) => handleChange('paddingTop', v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
                <SelectItem value="xl">X-Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Padding Bottom</Label>
            <Select value={data.paddingBottom ?? 'md'} onValueChange={(v) => handleChange('paddingBottom', v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
                <SelectItem value="xl">X-Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Max Width</Label>
          <Select value={data.maxWidth ?? 'full'} onValueChange={(v) => handleChange('maxWidth', v)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small (640px)</SelectItem>
              <SelectItem value="md">Medium (768px)</SelectItem>
              <SelectItem value="lg">Large (1024px)</SelectItem>
              <SelectItem value="full">Full Width</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Content Alignment</Label>
          <Select value={data.align ?? 'left'} onValueChange={(v) => handleChange('align', v)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Styling */}
      <div className="space-y-4">
        <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Styling</h4>

        <div className="space-y-1.5">
          <Label className="text-xs">Background</Label>
          <Select value={data.background ?? 'none'} onValueChange={(v) => handleChange('background', v)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (White)</SelectItem>
              <SelectItem value="muted">Muted (Gray)</SelectItem>
              <SelectItem value="dark">Dark (Inverted)</SelectItem>
              <SelectItem value="brand-red">Brand Red</SelectItem>
              <SelectItem value="brand-green">Brand Green</SelectItem>
              <SelectItem value="navy">Dark Navy</SelectItem>
            </SelectContent>
          </Select>
          {/* Colour swatch preview */}
          {data.background && data.background !== 'none' && (
            <div className={`h-4 rounded border ${
              data.background === 'brand-red' ? 'bg-[#BC0D2A]' :
              data.background === 'brand-green' ? 'bg-[#328542]' :
              data.background === 'navy' ? 'bg-[#0b0f19]' :
              data.background === 'muted' ? 'bg-slate-100' :
              data.background === 'dark' ? 'bg-slate-900' : ''
            }`} />
          )}
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-xs">Hide on Mobile</Label>
          <Switch
            checked={!!data.hideOnMobile}
            onCheckedChange={(v) => handleChange('hideOnMobile', v)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Custom CSS Class</Label>
          <Input
            value={data.customClassName ?? ''}
            onChange={(e) => handleChange('customClassName', e.target.value)}
            placeholder="e.g. hero-section"
            className="h-8 text-xs"
          />
        </div>
      </div>

      {/* Template-only controls */}
      {effectiveMode === 'template' && (
        <>
          <Separator />

          {/* Typography */}
          <div className="space-y-4">
            <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Typography</h4>

            <div className="space-y-1.5">
              <Label className="text-xs">Font Size</Label>
              <Select value={data.fontSize ?? 'base'} onValueChange={(v) => handleChange('fontSize', v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sm">Small</SelectItem>
                  <SelectItem value="base">Base</SelectItem>
                  <SelectItem value="lg">Large</SelectItem>
                  <SelectItem value="xl">X-Large</SelectItem>
                  <SelectItem value="2xl">2X-Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Font Weight</Label>
              <Select value={data.fontWeight ?? 'normal'} onValueChange={(v) => handleChange('fontWeight', v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="semibold">Semibold</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Text Color</Label>
              <Input
                value={data.textColor ?? ''}
                onChange={(e) => handleChange('textColor', e.target.value)}
                placeholder="#1a1a1a or text-slate-900"
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <Separator />

          {/* Border */}
          <div className="space-y-4">
            <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Border</h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Border Width</Label>
                <Select value={data.borderWidth ?? '0'} onValueChange={(v) => handleChange('borderWidth', v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    <SelectItem value="1">1px</SelectItem>
                    <SelectItem value="2">2px</SelectItem>
                    <SelectItem value="4">4px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Border Radius</Label>
                <Select value={data.borderRadius ?? 'none'} onValueChange={(v) => handleChange('borderRadius', v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                    <SelectItem value="full">Full</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Grid / Flex */}
          <div className="space-y-4">
            <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Grid / Flex</h4>

            <div className="space-y-1.5">
              <Label className="text-xs">Gap</Label>
              <Select value={data.gap ?? 'none'} onValueChange={(v) => handleChange('gap', v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="sm">Small</SelectItem>
                  <SelectItem value="md">Medium</SelectItem>
                  <SelectItem value="lg">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Grid Columns</Label>
              <Select value={data.gridColumns ?? '1'} onValueChange={(v) => handleChange('gridColumns', v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 column</SelectItem>
                  <SelectItem value="2">2 columns</SelectItem>
                  <SelectItem value="3">3 columns</SelectItem>
                  <SelectItem value="4">4 columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Media */}
          <div className="space-y-4">
            <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Media</h4>

            <div className="space-y-1.5">
              <Label className="text-xs">Aspect Ratio</Label>
              <Select value={data.aspectRatio ?? 'auto'} onValueChange={(v) => handleChange('aspectRatio', v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="square">Square (1:1)</SelectItem>
                  <SelectItem value="video">Video (16:9)</SelectItem>
                  <SelectItem value="portrait">Portrait (3:4)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────

export function Inspector({ selectedBlock, onChange, pageData, onPageChange, mode = 'static', repeaterContext }: InspectorProps) {
  return (
    <div className="h-full flex flex-col">
      {selectedBlock ? (
        // key on selectedBlock.id forces the panel (and every shadcn/Radix Select
        // it contains) to remount on block switches, guaranteeing each control
        // re-reads its value from the freshly-selected block's data.
        <BlockInspectorPanel
          key={selectedBlock.id}
          selectedBlock={selectedBlock}
          onChange={onChange}
          mode={mode}
          repeaterContext={repeaterContext}
        />
      ) : (
        <PageSettingsPanel pageData={pageData} onPageChange={onPageChange} />
      )}
    </div>
  );
}
