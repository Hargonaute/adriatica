'use client';

import React from 'react';
import { type BlockData, type PageData } from '@/types';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

interface InspectorProps {
  selectedBlock: { id: string; type: string; data: BlockData } | null;
  onChange: (id: string, data: Partial<BlockData>) => void;
  pageData: PageData;
  onPageChange: (updates: Partial<PageData>) => void;
}

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

// ── Block-level Inspector panel ────────────────────────────────────────────

function BlockInspectorPanel({
  selectedBlock,
  onChange,
}: {
  selectedBlock: { id: string; type: string; data: BlockData };
  onChange: (id: string, data: Partial<BlockData>) => void;
}) {
  const { data } = selectedBlock;

  const handleChange = (key: keyof BlockData, value: unknown) => {
    onChange(selectedBlock.id, { [key]: value });
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="font-semibold tracking-tight">Inspector</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Editing {selectedBlock.type}</p>
      </div>

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
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="muted">Muted (Gray)</SelectItem>
              <SelectItem value="dark">Dark (Inverted)</SelectItem>
            </SelectContent>
          </Select>
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
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────

export function Inspector({ selectedBlock, onChange, pageData, onPageChange }: InspectorProps) {
  return (
    <div className="h-full border-l bg-background w-[300px] flex flex-col overflow-y-auto">
      {selectedBlock ? (
        <BlockInspectorPanel selectedBlock={selectedBlock} onChange={onChange} />
      ) : (
        <PageSettingsPanel pageData={pageData} onPageChange={onPageChange} />
      )}
    </div>
  );
}
