'use client';

import { type BlockData } from '@/types';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const heightMap = {
  xs: 'h-4',
  sm: 'h-8',
  md: 'h-16',
  lg: 'h-24',
  xl: 'h-32',
};

const heightLabel = {
  xs: 'XS — 16px',
  sm: 'SM — 32px',
  md: 'MD — 64px',
  lg: 'LG — 96px',
  xl: 'XL — 128px',
};

// ── Editor ────────────────────────────────────────────────────────────────

export function SpacerEditor({
  block,
  onChange,
}: {
  block: BlockData & { type: 'spacer' };
  onChange: (updates: Partial<BlockData>) => void;
}) {
  return (
    <div className="p-4 border rounded-md space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Height</Label>
        <Select
          value={block.height ?? 'md'}
          onValueChange={(v) => onChange({ height: v as any })}
        >
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(heightLabel).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div
        className={`w-full border-2 border-dashed border-muted rounded flex items-center justify-center text-xs text-muted-foreground ${heightMap[(block.height ?? 'md') as keyof typeof heightMap]}`}
      >
        Spacer — {heightLabel[(block.height ?? 'md') as keyof typeof heightLabel]}
      </div>
    </div>
  );
}

// ── Preview ───────────────────────────────────────────────────────────────

export function SpacerPreview({ block }: { block: BlockData & { type: 'spacer' } }) {
  return <div className={heightMap[(block.height ?? 'md') as keyof typeof heightMap]} aria-hidden="true" />;
}
