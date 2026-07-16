'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type CatalogueBlockData } from '@/types';
import { CatalogueSection } from '@/components/home/CatalogueSection';

type Block = CatalogueBlockData;

// ── Editor ────────────────────────────────────────────────────────────────

export function CatalogueEditor({
  block,
  onChange,
}: {
  block: Block;
  onChange: (updates: Partial<Block>) => void;
}) {
  return (
    <div className="space-y-4 p-4 border rounded-md">
      <p className="text-xs text-muted-foreground">
        Full-width red catalogue section. The download link always points to
        <code> /Adriatica Final Catalogue.pdf</code>.
      </p>
      <div className="space-y-1.5">
        <Label className="text-xs">Heading</Label>
        <Input
          value={block.heading ?? ''}
          onChange={(e) => onChange({ heading: e.target.value })}
          placeholder="Téléchargez notre catalogue"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">CTA Label</Label>
        <Input
          value={block.ctaLabel ?? ''}
          onChange={(e) => onChange({ ctaLabel: e.target.value })}
          placeholder="Télécharger le catalogue"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Catalogue Image URL</Label>
        <Input
          value={block.imageUrl ?? ''}
          onChange={(e) => onChange({ imageUrl: e.target.value })}
          placeholder="https://example.com/catalogue.png"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Image Alt Text</Label>
        <Input
          value={block.imageAlt ?? ''}
          onChange={(e) => onChange({ imageAlt: e.target.value })}
          placeholder="Adriatica catalogue"
        />
      </div>
    </div>
  );
}

// ── Preview ───────────────────────────────────────────────────────────────

export function CataloguePreview({ block }: { block: Block }) {
  return (
    <CatalogueSection
      heading={block.heading ?? 'Téléchargez notre catalogue'}
      ctaLabel={block.ctaLabel ?? 'Télécharger le catalogue'}
      imageUrl={block.imageUrl ?? ''}
      imageAlt={block.imageAlt ?? 'Adriatica catalogue'}
    />
  );
}
