'use client';

import { use, useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextInput } from '@/components/ui/rich-text-input';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Pencil, Trash2, X, Check, Upload, Download, FileUp, ExternalLink, ChevronUp, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { BulkImportDialog } from '@/components/dashboard/BulkImportDialog';
import { buildTemplateCSV, buildEntriesCSV, downloadCSV } from '@/lib/csv';
import { slugify } from '@/lib/slugify';
import type { FieldType } from '@/types';

interface Field {
  id: string;
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  order: number;
  options?: any;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
  basePath: string | null;
  itemSlugField: string | null;
  detailTemplatePageId: string | null;
  fields: Field[];
}

interface Entry {
  id: string;
  collectionId: string;
  slug: string | null;
  status: 'draft' | 'published';
  data: Record<string, any>;
  createdAt: string;
}

// ── Image field with Vercel Blob upload ───────────────────────────────────────

function ImageFieldInput({
  value,
  onChange,
}: {
  value: any;
  onChange: (val: string) => void;
}) {
  const base = 'w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring';
  const [blobConfigured, setBlobConfigured] = useState<boolean | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/image-upload')
      .then(r => r.json())
      .then(d => setBlobConfigured(!!d.blobConfigured))
      .catch(() => setBlobConfigured(false));
  }, []);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/image-upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      onChange(data.url);
      toast.success('Image uploaded');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!blobConfigured || uploading}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            {uploading ? 'Uploading…' : 'Upload image'}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            className="sr-only"
            onChange={handleFile}
          />
        </div>
        {blobConfigured === false && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Add <code className="font-mono">BLOB_READ_WRITE_TOKEN</code> to <code className="font-mono">.env.local</code> to enable uploads.
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="flex-1 border-t" />
        <span>or paste a URL</span>
        <div className="flex-1 border-t" />
      </div>
      <input
        type="url"
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder="https://example.com/image.jpg"
        className={base}
      />
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={String(value)}
          alt="preview"
          className="w-full max-h-48 object-cover rounded-md border"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      )}
    </div>
  );
}

// ── List field input ──────────────────────────────────────────────────────────

function ListFieldInput({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: any;
  onChange: (val: any) => void;
}) {
  const base = 'w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring';
  const opts = field.options as { itemType?: string; subFields?: Array<{ key: string; label: string; type: string }> } | undefined;
  const itemType = opts?.itemType ?? 'text';
  const subFields = opts?.subFields ?? [];
  const items: any[] = Array.isArray(value) ? value : [];

  const updateItem = (i: number, v: any) => {
    const next = [...items];
    next[i] = v;
    onChange(next);
  };

  const updateSubField = (i: number, key: string, v: any) => {
    const next = [...items];
    next[i] = { ...(next[i] ?? {}), [key]: v };
    onChange(next);
  };

  const addItem = () => {
    const empty = itemType === 'object' ? {} : itemType === 'number' ? 0 : '';
    onChange([...items, empty]);
  };

  const removeItem = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  const moveItem = (i: number, dir: 1 | -1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const inputType = (t: string) =>
    t === 'number' ? 'number' : t === 'date' ? 'date' : t === 'url' ? 'url' : t === 'email' ? 'email' : 'text';

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex flex-col gap-0.5 pt-2">
            <button type="button" disabled={i === 0} onClick={() => moveItem(i, -1)} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button type="button" disabled={i === items.length - 1} onClick={() => moveItem(i, 1)} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            {itemType === 'object' ? (
              <div className="space-y-2 p-3 border rounded-md bg-muted/20">
                {subFields.map(sf => (
                  <div key={sf.key} className="space-y-1">
                    <label className="text-xs text-muted-foreground">{sf.label}</label>
                    <input
                      type={inputType(sf.type)}
                      value={item?.[sf.key] ?? ''}
                      onChange={e => updateSubField(i, sf.key, sf.type === 'number' ? Number(e.target.value) : e.target.value)}
                      className={base}
                    />
                  </div>
                ))}
                {subFields.length === 0 && (
                  <p className="text-xs text-muted-foreground">No sub-fields defined.</p>
                )}
              </div>
            ) : (
              <input
                type={inputType(itemType)}
                value={item ?? ''}
                onChange={e => updateItem(i, itemType === 'number' ? Number(e.target.value) : e.target.value)}
                placeholder={`Item ${i + 1}`}
                className={base}
              />
            )}
          </div>
          <button type="button" onClick={() => removeItem(i)} className="text-muted-foreground hover:text-destructive mt-2 shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addItem} className="text-xs">
        <Plus className="h-3.5 w-3.5 mr-1.5" /> Add item
      </Button>
    </div>
  );
}

// ── Reference field input ─────────────────────────────────────────────────────

function ReferenceFieldInput({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: any;
  onChange: (val: any) => void;
}) {
  const opts = field.options as { collection?: string; multiple?: boolean } | undefined;
  const [entries, setEntries] = useState<Array<{ id: string; slug: string | null; data: Record<string, any> }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!opts?.collection) return;
    setLoading(true);
    fetch(`/api/entries?collectionId=${opts.collection}`)
      .then(r => r.json())
      .then(d => setEntries(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [opts?.collection]);

  if (!opts?.collection) {
    return <p className="text-sm text-muted-foreground italic">No target collection configured.</p>;
  }

  const getLabel = (entry: { id: string; slug: string | null; data: Record<string, any> }) =>
    entry.slug ?? Object.values(entry.data).find((v): v is string => typeof v === 'string' && !!v) ?? entry.id;

  if (loading) return <p className="text-sm text-muted-foreground">Loading references…</p>;

  if (opts.multiple) {
    const selected: string[] = Array.isArray(value) ? value : [];
    const toggle = (id: string) =>
      onChange(selected.includes(id) ? selected.filter(v => v !== id) : [...selected, id]);
    return (
      <div className="max-h-48 overflow-y-auto border rounded-md divide-y">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground p-3">No entries in target collection.</p>
        ) : entries.map(entry => (
          <label key={entry.id} className="flex items-center gap-2 px-3 py-2 hover:bg-muted cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(entry.id)}
              onChange={() => toggle(entry.id)}
              className="h-4 w-4 rounded border"
            />
            <span className="text-sm">{getLabel(entry)}</span>
          </label>
        ))}
      </div>
    );
  }

  return (
    <Select value={value ?? '__none__'} onValueChange={v => onChange(v === '__none__' ? null : v)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a reference…" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__none__">— None —</SelectItem>
        {entries.map(entry => (
          <SelectItem key={entry.id} value={entry.id}>{getLabel(entry)}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ── Dynamic field renderer ────────────────────────────────────────────────────

function FieldInput({
  field,
  value,
  onChange,
  siblingValues,
}: {
  field: Field;
  value: any;
  onChange: (val: any) => void;
  siblingValues?: Record<string, any>;
}) {
  const base = 'w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring';

  if (field.type === 'rich-text') {
    return <RichTextInput value={value ?? ''} onChange={onChange} minHeight="180px" />;
  }

  if (field.type === 'image') {
    return <ImageFieldInput value={value} onChange={onChange} />;
  }

  if (field.type === 'textarea') {
    return (
      <textarea
        rows={4}
        required={field.required}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        className={`${base} resize-none`}
      />
    );
  }

  if (field.type === 'checkbox') {
    return (
      <div className="flex items-center gap-2 mt-1">
        <input
          type="checkbox"
          id={field.key}
          checked={!!value}
          onChange={e => onChange(e.target.checked)}
          className="h-4 w-4 rounded border"
        />
        <label htmlFor={field.key} className="text-sm">{field.label}</label>
      </div>
    );
  }

  if (field.type === 'select') {
    const opts: Array<{ label: string; value: string }> = field.options?.options ?? [];
    return (
      <Select value={value ?? '__none__'} onValueChange={v => onChange(v === '__none__' ? null : v)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select an option…" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">— None —</SelectItem>
          {opts.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (field.type === 'multi-select') {
    const opts: Array<{ label: string; value: string }> = field.options?.options ?? [];
    const selected: string[] = Array.isArray(value) ? value : [];
    const toggle = (val: string) =>
      onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);
    return (
      <div className="flex flex-wrap gap-2">
        {opts.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No options configured.</p>
        ) : opts.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`px-3 py-1 rounded-full border text-sm transition-colors ${
              selected.includes(opt.value)
                ? 'bg-primary text-primary-foreground border-primary'
                : 'hover:border-foreground/50 bg-background'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    );
  }

  if (field.type === 'list') {
    return <ListFieldInput field={field} value={value} onChange={onChange} />;
  }

  if (field.type === 'url') {
    return (
      <input
        type="url"
        required={field.required}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder="https://example.com"
        className={base}
      />
    );
  }

  if (field.type === 'reference') {
    return <ReferenceFieldInput field={field} value={value} onChange={onChange} />;
  }

  if (field.type === 'slug') {
    const opts = field.options as { source?: string } | undefined;
    const sourceValue = opts?.source ? siblingValues?.[opts.source] : undefined;
    const canGenerate = opts?.source && sourceValue != null && sourceValue !== '';
    return (
      <div className="space-y-1.5">
        <div className="flex gap-2">
          <input
            type="text"
            required={field.required}
            value={value ?? ''}
            onChange={e => onChange(slugify(e.target.value))}
            placeholder="url-friendly-slug"
            className={`${base} font-mono flex-1`}
          />
          {canGenerate && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange(slugify(String(sourceValue)))}
              title={`Generate from "${opts?.source}"`}
            >
              Auto
            </Button>
          )}
        </div>
        {value && <p className="text-xs text-muted-foreground font-mono">/{value}</p>}
      </div>
    );
  }

  return (
    <input
      type={field.type}
      required={field.required}
      value={value ?? ''}
      onChange={e => onChange(field.type === 'number' ? Number(e.target.value) : e.target.value)}
      className={base}
    />
  );
}

// ── Item form (create or edit) ────────────────────────────────────────────────

function ItemForm({
  fields,
  collectionSlug,
  slugSourceKey,
  initialSlug = '',
  initial,
  onSubmit,
  onCancel,
  submitting,
}: {
  fields: Field[];
  collectionSlug: string;
  slugSourceKey: string | null;
  initialSlug?: string;
  initial?: Record<string, any>;
  onSubmit: (slug: string, data: Record<string, any>) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}) {
  const [values, setValues] = useState<Record<string, any>>(initial ?? {});
  const [slug, setSlug] = useState(initialSlug);
  const [slugTouched, setSlugTouched] = useState(!!initialSlug);

  const set = (key: string, val: any) => {
    setValues(prev => {
      const next = { ...prev, [key]: val };
      // Auto-fill empty slug-type fields that source from this key
      if (typeof val === 'string') {
        fields.forEach(f => {
          if (f.type === 'slug' && f.options?.source === key && !prev[f.key]) {
            next[f.key] = slugify(val);
          }
        });
      }
      return next;
    });
    if (!slugTouched && slugSourceKey && key === slugSourceKey && typeof val === 'string') {
      setSlug(slugify(val));
    }
  };

  const trimmedSlug = slug.trim();
  const slugEmpty = trimmedSlug === '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (slugEmpty) return;
    // Client-side validation for fields with constraints
    for (const field of fields) {
      const val = values[field.key];
      const isEmpty = val == null || val === '' || (Array.isArray(val) && val.length === 0);
      if (field.required && isEmpty) {
        toast.error(`${field.label} is required.`);
        return;
      }
      if (!isEmpty && field.type === 'multi-select' && field.options) {
        const min: number | undefined = field.options.min;
        const max: number | undefined = field.options.max;
        const count = Array.isArray(val) ? val.length : 0;
        if (min != null && count < min) {
          toast.error(`${field.label}: select at least ${min} option(s).`);
          return;
        }
        if (max != null && count > max) {
          toast.error(`${field.label}: select at most ${max} option(s).`);
          return;
        }
      }
    }
    await onSubmit(trimmedSlug, values);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* URL slug — required, powers the item detail page */}
      <div className="space-y-1.5">
        <Label className="text-sm">
          URL Slug <span className="text-destructive ml-0.5">*</span>
        </Label>
        <Input
          value={slug}
          onChange={e => { setSlugTouched(true); setSlug(slugify(e.target.value)); }}
          placeholder="e.g. kamab-26"
          className={`font-mono ${slugEmpty ? 'border-destructive focus-visible:ring-destructive' : ''}`}
        />
        {slugEmpty ? (
          <p className="text-xs text-destructive">
            Required — the detail page URL cannot resolve without a slug.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Page will be at:{' '}
            <code className="font-mono">/collections/{collectionSlug}/{trimmedSlug}</code>
          </p>
        )}
      </div>

      {fields.map(field => (
        <div key={field.id} className="space-y-1.5">
          {field.type !== 'checkbox' && (
            <Label className="text-sm">
              {field.label}
              {field.required && <span className="text-destructive ml-0.5">*</span>}
            </Label>
          )}
          <FieldInput
            field={field}
            value={values[field.key]}
            onChange={val => set(field.key, val)}
            siblingValues={values}
          />
        </div>
      ))}

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={submitting || slugEmpty}>
          <Check className="h-4 w-4 mr-1.5" />
          {submitting ? 'Saving…' : 'Save Item'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          <X className="h-4 w-4 mr-1.5" /> Cancel
        </Button>
      </div>
    </form>
  );
}

// ── Field preview helper (card list view) ────────────────────────────────────

function fieldPreview(field: Field, val: any): string {
  if (val == null || val === '') return '—';
  switch (field.type) {
    case 'checkbox':
      return val ? '✓ Yes' : '✗ No';
    case 'rich-text':
      return String(val).replace(/<[^>]*>/g, '').slice(0, 80) || '—';
    case 'select': {
      const opt = (field.options?.options ?? []).find((o: any) => o.value === val);
      return opt?.label ?? String(val).slice(0, 80);
    }
    case 'multi-select': {
      if (!Array.isArray(val) || val.length === 0) return '—';
      const opts: any[] = field.options?.options ?? [];
      return val.map((v: string) => {
        const o = opts.find((x: any) => x.value === v);
        return o?.label ?? v;
      }).join(', ').slice(0, 80);
    }
    case 'list':
      return Array.isArray(val) ? `${val.length} item${val.length !== 1 ? 's' : ''}` : '—';
    case 'reference': {
      const ids = Array.isArray(val) ? val : [val];
      return ids.length > 0 ? `${ids.length} ref${ids.length !== 1 ? 's' : ''}` : '—';
    }
    default:
      return String(val).slice(0, 80);
  }
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ItemsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [items, setItems] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [colRes, itemsRes] = await Promise.all([
        fetch(`/api/collections/${id}`),
        fetch(`/api/entries?collectionId=${id}&includeUnpublished=true`),
      ]);
      const col = await colRes.json();
      const its = await itemsRes.json();
      if (col.error) throw new Error(col.error);
      setCollection(col);
      setItems(Array.isArray(its) ? its : []);
    } catch {
      toast.error('Failed to load collection');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async (slug: string, data: Record<string, any>) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId: id, data, slug }),
      });
      if (!res.ok) throw new Error('Failed to create');
      const newItem = await res.json();
      setItems(prev => [newItem, ...prev]);
      setShowCreateForm(false);
      toast.success('Item created');
    } catch {
      toast.error('Failed to create item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (itemId: string, slug: string, data: Record<string, any>) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/entries/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, slug }),
      });
      if (!res.ok) throw new Error('Failed to update');
      const updated = await res.json();
      setItems(prev => prev.map(i => i.id === itemId ? updated : i));
      setEditingId(null);
      toast.success('Item updated');
    } catch {
      toast.error('Failed to update item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Delete this item? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/entries/${itemId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      setItems(prev => prev.filter(i => i.id !== itemId));
      toast.success('Item deleted');
    } catch {
      toast.error('Failed to delete item');
    }
  };

  if (loading) return <div className="p-10 text-center text-muted-foreground">Loading…</div>;
  if (!collection) return <div className="p-10 text-center text-muted-foreground">Collection not found</div>;

  const fields = collection.fields;
  const slugSourceKey =
    collection.itemSlugField ??
    fields.find(f => f.type === 'text')?.key ??
    null;
  const missingSlugCount = items.filter(i => !i.slug || !i.slug.trim()).length;

  return (
    <div className="space-y-6 max-w-5xl pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/collections/${id}`}>
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{collection.name}</h1>
            <p className="text-muted-foreground text-sm">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {fields.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadCSV(`${collection.slug}-template.csv`, buildTemplateCSV(fields))}
                title="Download an empty CSV with the correct headers"
              >
                <Download className="h-4 w-4 mr-1.5" /> Template
              </Button>
              {items.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadCSV(
                      `${collection.slug}-export.csv`,
                      buildEntriesCSV(
                        fields.map(f => ({ key: f.key, label: f.label, type: f.type, required: f.required })),
                        items.map(i => ({ id: i.id, slug: i.slug, data: i.data })),
                      ),
                    )
                  }
                  title="Download all items as CSV (edit and re-import to update them)"
                >
                  <Download className="h-4 w-4 mr-1.5" /> Bulk Export
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkImport(true)}
              >
                <FileUp className="h-4 w-4 mr-1.5" /> Bulk Import
              </Button>
            </>
          )}
          {!showCreateForm && (
            <Button onClick={() => { setShowCreateForm(true); setEditingId(null); }}>
              <Plus className="h-4 w-4 mr-1.5" /> New Item
            </Button>
          )}
        </div>
      </div>

      {/* Missing-slug warning banner */}
      {missingSlugCount > 0 && (
        <div className="rounded-md border border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 px-4 py-3 text-sm">
          <span className="font-medium">
            {missingSlugCount} {missingSlugCount === 1 ? 'entry is' : 'entries are'} missing slugs
          </span>
          {' '}— detail page URLs won't work until slugs are added. Open each entry and save it with a slug.
        </div>
      )}

      <BulkImportDialog
        open={showBulkImport}
        onOpenChange={setShowBulkImport}
        collectionId={id}
        fields={fields.map(f => ({ key: f.key, label: f.label, type: f.type, required: f.required }))}
        onImported={fetchData}
      />

      {/* No fields warning */}
      {fields.length === 0 && (
        <div className="rounded-lg border-2 border-dashed p-8 text-center text-muted-foreground">
          <p className="font-medium">No fields defined yet.</p>
          <p className="text-sm mt-1">
            <Link href={`/dashboard/collections/${id}`} className="underline">Go back</Link> and add fields to this collection first.
          </p>
        </div>
      )}

      {/* Create form */}
      {showCreateForm && fields.length > 0 && (
        <Card className="border-primary/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">New Item</CardTitle>
          </CardHeader>
          <CardContent>
            <ItemForm
              fields={fields}
              collectionSlug={collection.slug}
              slugSourceKey={slugSourceKey}
              onSubmit={handleCreate}
              onCancel={() => setShowCreateForm(false)}
              submitting={submitting}
            />
          </CardContent>
        </Card>
      )}

      {/* Items list */}
      {items.length === 0 && !showCreateForm ? (
        <div className="rounded-lg border-2 border-dashed p-12 text-center text-muted-foreground">
          <p className="font-medium">No items yet</p>
          <p className="text-sm mt-1">Click "New Item" to add your first entry.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <Card key={item.id}>
              {editingId === item.id ? (
                <>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Edit Item</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ItemForm
                      fields={fields}
                      collectionSlug={collection.slug}
                      slugSourceKey={slugSourceKey}
                      initialSlug={item.slug ?? ''}
                      initial={item.data}
                      onSubmit={(slug, data) => handleUpdate(item.id, slug, data)}
                      onCancel={() => setEditingId(null)}
                      submitting={submitting}
                    />
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex items-start justify-between gap-4 py-4">
                  {(!item.slug || !item.slug.trim()) && (
                    <span
                      className="shrink-0 inline-flex items-center rounded-full bg-destructive/10 text-destructive text-xs font-semibold px-2 py-0.5 mt-0.5"
                      title="This entry has no slug — its detail page won't resolve. Edit it to add one."
                    >
                      No slug
                    </span>
                  )}
                  <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
                    {fields.slice(0, 4).map(field => {
                      const val = item.data[field.key];
                      if (field.type === 'image' && val) {
                        return (
                          <div key={field.key} className="min-w-0">
                            <span className="text-xs text-muted-foreground block mb-1">{field.label}</span>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={String(val)}
                              alt={field.label}
                              className="h-10 w-10 rounded object-cover border"
                              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          </div>
                        );
                      }
                      return (
                        <div key={field.key} className="min-w-0">
                          <span className="text-xs text-muted-foreground block">{field.label}</span>
                          <span className="text-sm font-medium truncate block">{fieldPreview(field, val)}</span>
                        </div>
                      );
                    })}
                    <div className="text-xs text-muted-foreground self-end">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {item.status === 'published' && item.slug && collection.detailTemplatePageId && (
                      <a
                        href={`/fr/collections/${collection.basePath ?? collection.slug}/${item.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View live"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => { setEditingId(item.id); setShowCreateForm(false); }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
