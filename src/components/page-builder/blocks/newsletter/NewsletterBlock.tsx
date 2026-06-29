'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BlockData } from '@/types';
import { NewsletterCTA, type NewsletterSectionBg } from '@/components/shared/NewsletterCTA';

// ── Editor ────────────────────────────────────────────────────────────────

const sectionBgSwatch: Record<NewsletterSectionBg, string> = {
  'brand-red':   'bg-[#BC0D2A]',
  'brand-green': 'bg-[#328542]',
  'navy':        'bg-[#0b0f19]',
  'gray':        'bg-slate-100',
};

export function NewsletterEditor({
  block,
  onChange,
}: {
  block: BlockData & { type: 'newsletter' };
  onChange: (updates: Partial<BlockData>) => void;
}) {
  return (
    <div className="space-y-4 p-4 border rounded-md">
      <p className="text-xs text-muted-foreground">
        Renders the real newsletter CTA. The form posts to <code>/api/entries/create</code> against the <code>newsletter</code> collection.
      </p>
      <div className="space-y-1.5">
        <Label className="text-xs">Heading</Label>
        <Input
          value={block.heading ?? ''}
          onChange={(e) => onChange({ heading: e.target.value })}
          placeholder="Newsletter"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Body Text</Label>
        <Input
          value={block.body ?? ''}
          onChange={(e) => onChange({ body: e.target.value })}
          placeholder="Restez informé sur les dernières nouveautés!"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Button Label</Label>
        <Input
          value={block.buttonLabel ?? ''}
          onChange={(e) => onChange({ buttonLabel: e.target.value })}
          placeholder="S'inscrire"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Image URL</Label>
        <Input
          value={block.imageUrl ?? ''}
          onChange={(e) => onChange({ imageUrl: e.target.value })}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Section Background</Label>
        <Select
          value={block.sectionBg ?? 'brand-red'}
          onValueChange={(v) => onChange({ sectionBg: v as NewsletterSectionBg })}
        >
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="brand-red">Brand Red</SelectItem>
            <SelectItem value="brand-green">Brand Green</SelectItem>
            <SelectItem value="navy">Dark Navy</SelectItem>
            <SelectItem value="gray">Light Gray</SelectItem>
          </SelectContent>
        </Select>
        <div className={`h-4 rounded border ${sectionBgSwatch[(block.sectionBg ?? 'brand-red') as NewsletterSectionBg]}`} />
      </div>
    </div>
  );
}

// ── Preview ───────────────────────────────────────────────────────────────
// Pixel-perfect: reuses the real <NewsletterCTA>. The form posts to
// /api/entries/create — same endpoint, same flow as the live site.

export function NewsletterPreview({ block }: { block: BlockData & { type: 'newsletter' } }) {
  return (
    <NewsletterCTA
      heading={block.heading || undefined}
      body={block.body || undefined}
      buttonLabel={block.buttonLabel || undefined}
      imageUrl={block.imageUrl || undefined}
      sectionBg={(block.sectionBg as NewsletterSectionBg) || undefined}
    />
  );
}
