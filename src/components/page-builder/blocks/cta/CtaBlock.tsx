'use client';

import { type BlockData } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// ── Editor ────────────────────────────────────────────────────────────────

export function CtaEditor({
  block,
  onChange,
}: {
  block: BlockData & { type: 'cta' };
  onChange: (updates: Partial<BlockData>) => void;
}) {
  return (
    <div className="space-y-4 p-4 border rounded-md">
      <div className="space-y-1.5">
        <Label className="text-xs">Headline *</Label>
        <Input
          value={block.headline ?? ''}
          onChange={(e) => onChange({ headline: e.target.value })}
          placeholder="Ready to get started?"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Body Text</Label>
        <Input
          value={block.body ?? ''}
          onChange={(e) => onChange({ body: e.target.value })}
          placeholder="Join thousands of teams already using our platform."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Primary Button Label *</Label>
          <Input
            value={block.primaryLabel ?? ''}
            onChange={(e) => onChange({ primaryLabel: e.target.value })}
            placeholder="Get Started"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Primary Button URL *</Label>
          <Input
            value={block.primaryUrl ?? ''}
            onChange={(e) => onChange({ primaryUrl: e.target.value })}
            placeholder="/signup"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Secondary Button Label</Label>
          <Input
            value={block.secondaryLabel ?? ''}
            onChange={(e) => onChange({ secondaryLabel: e.target.value })}
            placeholder="Talk to Sales"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Secondary Button URL</Label>
          <Input
            value={block.secondaryUrl ?? ''}
            onChange={(e) => onChange({ secondaryUrl: e.target.value })}
            placeholder="/contact"
          />
        </div>
      </div>
    </div>
  );
}

// ── Preview ───────────────────────────────────────────────────────────────

export function CtaPreview({ block }: { block: BlockData & { type: 'cta' } }) {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          {block.headline || 'Ready to get started?'}
        </h2>
        {block.body && (
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">{block.body}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        {block.primaryLabel && (
          <a
            href={block.primaryUrl || '#'}
            className="inline-flex items-center px-6 py-3 rounded-lg bg-foreground text-background font-semibold hover:bg-foreground/90 transition-colors"
          >
            {block.primaryLabel}
          </a>
        )}
        {block.secondaryLabel && (
          <a
            href={block.secondaryUrl || '#'}
            className="inline-flex items-center px-6 py-3 rounded-lg border font-semibold hover:bg-muted transition-colors"
          >
            {block.secondaryLabel}
          </a>
        )}
      </div>
    </div>
  );
}
