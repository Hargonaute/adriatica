'use client';

import { useState, useEffect } from 'react';
import { type BlockData } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface Collection {
  id: string;
  name: string;
  slug: string;
  fields: { id: string; key: string; label: string; type: string }[];
}

interface Entry {
  id: string;
  data: Record<string, any>;
  createdAt: string;
}

// ── Editor ────────────────────────────────────────────────────────────────────

export function CollectionListEditor({
  block,
  onChange,
}: {
  block: BlockData & { type: 'collection-list' };
  onChange: (updates: Partial<BlockData>) => void;
}) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [loadingCols, setLoadingCols] = useState(true);

  useEffect(() => {
    fetch('/api/collections')
      .then(r => r.json())
      .then((data: Collection[]) => setCollections(Array.isArray(data) ? data : []))
      .catch(() => setCollections([]))
      .finally(() => setLoadingCols(false));
  }, []);

  // When collection changes, fetch its fields
  useEffect(() => {
    if (!block.collectionId) { setSelectedCollection(null); return; }
    fetch(`/api/collections/${block.collectionId}`)
      .then(r => r.json())
      .then(data => setSelectedCollection(data.error ? null : data))
      .catch(() => setSelectedCollection(null));
  }, [block.collectionId]);

  return (
    <div className="space-y-4 p-4 border rounded-md">
      {/* Collection picker */}
      <div className="space-y-1.5">
        <Label>Collection</Label>
        {loadingCols ? (
          <p className="text-xs text-muted-foreground">Loading collections…</p>
        ) : collections.length === 0 ? (
          <p className="text-xs text-destructive">No collections found. Create one first.</p>
        ) : (
          <Select
            value={block.collectionId || ''}
            onValueChange={v => {
              const col = collections.find(c => c.id === v);
              onChange({ collectionId: v, collectionSlug: col?.slug ?? '', displayFields: [] });
            }}
          >
            <SelectTrigger><SelectValue placeholder="— Select a collection —" /></SelectTrigger>
            <SelectContent>
              {collections.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {selectedCollection && (
        <>
          {/* Fields to display */}
          <div className="space-y-1.5">
            <Label className="text-xs">Fields to display</Label>
            <div className="space-y-1.5">
              {selectedCollection.fields.map(field => {
                const checked = (block.displayFields as string[] | undefined)?.includes(field.key) ?? false;
                return (
                  <label key={field.key} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={e => {
                        const current = (block.displayFields as string[] | undefined) ?? [];
                        const next = e.target.checked
                          ? [...current, field.key]
                          : current.filter(k => k !== field.key);
                        onChange({ displayFields: next });
                      }}
                      className="h-4 w-4 rounded border"
                    />
                    <span>{field.label}</span>
                    <span className="text-xs text-muted-foreground font-mono">({field.key})</span>
                  </label>
                );
              })}
            </div>
            {selectedCollection.fields.length === 0 && (
              <p className="text-xs text-muted-foreground">This collection has no fields yet.</p>
            )}
          </div>

          {/* Layout */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Layout</Label>
              <Select
                value={(block.layout as string) || 'grid-3'}
                onValueChange={v => onChange({ layout: v })}
              >
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="list">List (vertical)</SelectItem>
                  <SelectItem value="grid-2">Grid — 2 columns</SelectItem>
                  <SelectItem value="grid-3">Grid — 3 columns</SelectItem>
                  <SelectItem value="grid-4">Grid — 4 columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Max items</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={(block.limit as number) || 12}
                onChange={e => onChange({ limit: Number(e.target.value) })}
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Image field — text + image type fields */}
          <div className="space-y-1.5">
            <Label className="text-xs">Image field key <span className="text-muted-foreground">(optional)</span></Label>
            <Select
              value={(block.imageField as string) || ''}
              onValueChange={v => onChange({ imageField: v === '__none__' ? '' : v })}
            >
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="No image" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No image</SelectItem>
                {selectedCollection.fields
                  .filter(f => f.type === 'text' || f.type === 'image')
                  .map(f => (
                    <SelectItem key={f.key} value={f.key}>{f.label} ({f.key})</SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Pick the field that contains an image URL.</p>
          </div>

          {/* Title field */}
          <div className="space-y-1.5">
            <Label className="text-xs">Title field key <span className="text-muted-foreground">(optional — used as card heading)</span></Label>
            <Select
              value={(block.titleField as string) || ''}
              onValueChange={v => onChange({ titleField: v === '__none__' ? '' : v })}
            >
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="No title" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No title</SelectItem>
                {selectedCollection.fields.map(f => (
                  <SelectItem key={f.key} value={f.key}>{f.label} ({f.key})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Link to item pages */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <Label className="text-xs">Link cards to item pages</Label>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Each card links to /collections/{(block.collectionSlug as string) || selectedCollection.slug}/&#123;id&#125;
              </p>
            </div>
            <Switch
              checked={!!(block.linkToItems)}
              onCheckedChange={v => onChange({ linkToItems: v })}
            />
          </div>
        </>
      )}
    </div>
  );
}

// ── Preview / Public rendering ────────────────────────────────────────────────

const gridClass: Record<string, string> = {
  'list':   'grid grid-cols-1',
  'grid-2': 'grid grid-cols-1 sm:grid-cols-2',
  'grid-3': 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  'grid-4': 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

export function CollectionListPreview({
  block,
  className,
}: {
  block: BlockData & { type: 'collection-list' };
  className?: string;
}) {
  const [items, setItems] = useState<Entry[]>([]);
  const [fields, setFields] = useState<{ key: string; label: string; type: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const collectionId = block.collectionId as string | undefined;
  const collectionSlug = (block.collectionSlug as string | undefined) ?? '';
  const displayFields = (block.displayFields as string[] | undefined) ?? [];
  const layout = (block.layout as string | undefined) ?? 'grid-3';
  const limit = (block.limit as number | undefined) ?? 12;
  const imageField = (block.imageField as string | undefined) ?? '';
  const titleField = (block.titleField as string | undefined) ?? '';
  const linkToItems = !!(block.linkToItems);

  useEffect(() => {
    if (!collectionId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/collections/${collectionId}`).then(r => r.json()),
      fetch(`/api/entries?collectionId=${collectionId}`).then(r => r.json()),
    ])
      .then(([col, ents]) => {
        setFields(Array.isArray(col.fields) ? col.fields : []);
        setItems(Array.isArray(ents) ? ents.slice(0, limit) : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [collectionId, limit]);

  if (!collectionId) {
    return (
      <div className="border-2 border-dashed border-muted-foreground/30 rounded-md p-8 text-center text-sm text-muted-foreground">
        No collection selected. Edit this block to pick a collection.
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cn(gridClass[layout] ?? gridClass['grid-3'], 'gap-6', className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-muted animate-pulse h-40" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="border-2 border-dashed border-muted-foreground/30 rounded-md p-8 text-center text-sm text-muted-foreground">
        No items in this collection yet.
      </div>
    );
  }

  // Which fields to actually render — if none picked, show all
  const visibleFields = fields.filter(f =>
    displayFields.length === 0 ? true : displayFields.includes(f.key)
  );

  return (
    <div className={cn(gridClass[layout] ?? gridClass['grid-3'], 'gap-6', className)}>
      {items.map(item => {
        const imgUrl = imageField ? item.data[imageField] : null;
        const title = titleField ? item.data[titleField] : null;
        const href = linkToItems && collectionSlug ? `/collections/${collectionSlug}/${item.id}` : null;

        const cardContent = (
          <>
            {/* Image */}
            {imgUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={String(imgUrl)}
                alt={String(title ?? '')}
                className="w-full aspect-video object-cover"
                loading="lazy"
              />
            )}
            <div className="p-4 flex-1 space-y-2">
              {/* Title */}
              {title && (
                <h3 className="text-2xl font-semibold text-foreground leading-snug">{String(title)}</h3>
              )}
              {/* Other visible fields */}
              {visibleFields
                .filter(f => f.key !== imageField && f.key !== titleField)
                .map(f => {
                  const val = item.data[f.key];
                  if (val === undefined || val === null || val === '') return null;
                  if (f.type === 'checkbox') {
                    return (
                      <span key={f.key} className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        {val ? '✓' : '✗'} {f.label}
                      </span>
                    );
                  }
                  if (f.type === 'image') {
                    return (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={f.key}
                        src={String(val)}
                        alt={f.label}
                        className="w-full aspect-video object-cover rounded"
                        loading="lazy"
                      />
                    );
                  }
                  if (f.type === 'rich-text') {
                    return (
                      <div
                        key={f.key}
                        className="prose prose-sm max-w-none text-muted-foreground line-clamp-4"
                        dangerouslySetInnerHTML={{ __html: String(val) }}
                      />
                    );
                  }
                  return (
                    <p key={f.key} className="text-sm text-muted-foreground line-clamp-3">
                      {String(val)}
                    </p>
                  );
                })}
              <p className="text-xs text-muted-foreground pt-1">
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
          </>
        );

        return href ? (
          <a
            key={item.id}
            href={href}
            className="rounded-lg border bg-card overflow-hidden flex flex-col hover:shadow-md hover:border-primary/40 transition-all"
          >
            {cardContent}
          </a>
        ) : (
          <div key={item.id} className="rounded-lg border bg-card overflow-hidden flex flex-col">
            {cardContent}
          </div>
        );
      })}
    </div>
  );
}
