'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CatalogueIntros, IntroFacet } from '@/lib/products/catalogueIntros';

export interface IntroRow {
  facet: IntroFacet;
  slug: string;
  fr: string;
  en: string;
  frHref: string;
  enHref: string;
}

export function CatalogueIntrosForm({
  initial,
  familles,
  cultures,
  maxLength,
}: {
  initial: CatalogueIntros;
  familles: IntroRow[];
  cultures: IntroRow[];
  maxLength: number;
}) {
  const [intros, setIntros] = useState<CatalogueIntros>(initial);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const setText = (row: IntroRow, locale: 'fr' | 'en', value: string) => {
    setIntros((prev) => ({
      ...prev,
      [row.facet]: {
        ...prev[row.facet],
        [row.slug]: { ...(prev[row.facet][row.slug] ?? { fr: '', en: '' }), [locale]: value },
      },
    }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/catalogue-intros', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(intros),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? `HTTP ${res.status}`);
      setIntros((await res.json()) as CatalogueIntros);
      setDirty(false);
      toast.success('Intros saved.');
    } catch (e) {
      toast.error(`Save failed: ${e instanceof Error ? e.message : 'unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const section = (title: string, rows: IntroRow[]) => (
    <section className="rounded-xl border bg-card p-6 space-y-6">
      <h2 className="text-base font-semibold">{title}</h2>
      {rows.map((row) => {
        const value = intros[row.facet][row.slug] ?? { fr: '', en: '' };
        return (
          <div key={row.slug} className="space-y-2 border-t pt-4 first:border-t-0 first:pt-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold">
                {row.fr} <span className="font-normal text-muted-foreground">/ {row.en}</span>
              </h3>
              <span className="text-xs text-muted-foreground">
                <a href={row.frHref} target="_blank" rel="noreferrer" className="underline">FR page</a>
                {' · '}
                <a href={row.enHref} target="_blank" rel="noreferrer" className="underline">EN page</a>
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {(['fr', 'en'] as const).map((l) => (
                <div key={l} className="space-y-1">
                  <Label htmlFor={`${row.facet}-${row.slug}-${l}`} className="text-xs uppercase">
                    {l}
                  </Label>
                  <Textarea
                    id={`${row.facet}-${row.slug}-${l}`}
                    value={value[l]}
                    maxLength={maxLength}
                    rows={3}
                    onChange={(e) => setText(row, l, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );

  return (
    <div className="space-y-8">
      {section('Familles', familles)}
      {section('Cultures', cultures)}
      <div className="sticky bottom-4 flex items-center justify-end gap-3">
        {dirty && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
        <Button type="button" onClick={save} disabled={saving || !dirty}>
          {saving ? 'Saving…' : 'Save intros'}
        </Button>
      </div>
    </div>
  );
}
