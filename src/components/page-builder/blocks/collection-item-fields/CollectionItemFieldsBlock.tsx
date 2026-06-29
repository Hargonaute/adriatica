'use client';

import React, { useEffect, useState } from 'react';
import { useCollectionItem } from '@/contexts/CollectionItemContext';
import { type CollectionItemFieldsBlockData } from '@/types';
import { PROSE_CLASSES } from '../proseClasses';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Field {
  id: string;
  key: string;
  label: string;
  type: string;
  required: boolean;
  order: number;
}

interface EntryPayload {
  id: string;
  collectionId: string;
  data: Record<string, any>;
}

interface CollectionPayload {
  id: string;
  name: string;
  slug: string;
  fields: Field[];
}

// ── Editor ────────────────────────────────────────────────────────────────────

export function CollectionItemFieldsEditor({
  block,
  onChange,
}: {
  block: CollectionItemFieldsBlockData;
  onChange: (updates: Partial<CollectionItemFieldsBlockData>) => void;
}) {
  const hidden = (block.hiddenFields ?? []).join(', ');

  return (
    <div className="space-y-4 text-sm">
      <p className="text-muted-foreground">
        This block displays an item's field values at render time. It reads data
        from the URL context — no configuration required to show all fields.
      </p>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Hide fields (comma-separated keys)
        </label>
        <input
          type="text"
          className="w-full border rounded-md px-3 py-1.5 text-sm bg-background font-mono"
          placeholder="e.g. internal_notes, draft_field"
          defaultValue={hidden}
          onBlur={e => {
            const keys = e.target.value
              .split(',')
              .map(s => s.trim())
              .filter(Boolean);
            onChange({ hiddenFields: keys });
          }}
        />
      </div>
    </div>
  );
}

// ── Preview ───────────────────────────────────────────────────────────────────

export function CollectionItemFieldsPreview({
  block,
}: {
  block: CollectionItemFieldsBlockData;
}) {
  const ctx = useCollectionItem();
  const [entry, setEntry] = useState<EntryPayload | null>(null);
  const [colData, setColData] = useState<CollectionPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ctx) return;

    setLoading(true);
    fetch(`/api/entries/${ctx.itemId}`)
      .then(r => r.json())
      .then((e: EntryPayload) => {
        setEntry(e);
        return fetch(`/api/collections/${e.collectionId}`);
      })
      .then(r => r.json())
      .then((c: CollectionPayload) => setColData(c))
      .catch(() => setError('Failed to load item data'))
      .finally(() => setLoading(false));
  }, [ctx?.itemId]);

  // No context — editing in page builder dashboard
  if (!ctx) {
    return (
      <div className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 text-center">
        <p className="text-muted-foreground text-sm font-medium">
          Item fields will appear here on the live detail page
        </p>
        {(block.hiddenFields ?? []).length > 0 && (
          <p className="text-xs text-muted-foreground/60 mt-1">
            Hidden: {block.hiddenFields!.join(', ')}
          </p>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground text-sm">Loading…</div>
    );
  }

  if (error || !entry || !colData) {
    return (
      <div className="py-12 text-center text-destructive text-sm">
        {error ?? 'Item not found'}
      </div>
    );
  }

  const hidden = new Set(block.hiddenFields ?? []);
  const itemData = entry.data;

  return (
    <div className="max-w-[860px] mx-auto space-y-8">
      {colData.fields.map(field => {
        if (hidden.has(field.key)) return null;
        const val = itemData[field.key];
        if (val === undefined || val === null || val === '') return null;

        return (
          <div key={field.id}>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              {field.label}
            </p>

            {field.type === 'image' && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={String(val)}
                alt={field.label}
                className="w-full max-h-[480px] object-cover rounded-2xl"
              />
            )}

            {field.type === 'rich-text' && (
              <div
                className={PROSE_CLASSES}
                dangerouslySetInnerHTML={{ __html: String(val) }}
              />
            )}

            {field.type === 'textarea' && (
              <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap">
                {String(val)}
              </p>
            )}

            {field.type === 'checkbox' && (
              <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${val ? 'text-foreground' : 'text-muted-foreground'}`}>
                {val ? '✓ Yes' : '✗ No'}
              </span>
            )}

            {field.type === 'email' && (
              <a
                href={`mailto:${String(val)}`}
                className="text-[#BC0D2A] font-medium hover:underline"
              >
                {String(val)}
              </a>
            )}

            {(field.type === 'text' || field.type === 'number' || field.type === 'date') && (
              <p className="text-base text-foreground">{String(val)}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
