'use client';

import { type BlockData } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

// ── Editor ────────────────────────────────────────────────────────────────

export function HeroEditor({
  block,
  onChange,
}: {
  block: BlockData & { type: 'hero' };
  onChange: (updates: Partial<BlockData>) => void;
}) {
  return (
    <div className="space-y-4 p-4 border rounded-md">
      <div className="space-y-1.5">
        <Label className="text-xs">Headline *</Label>
        <Input
          value={block.headline ?? ''}
          onChange={(e) => onChange({ headline: e.target.value })}
          placeholder="Your compelling headline"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Subheadline</Label>
        <Input
          value={block.subheadline ?? ''}
          onChange={(e) => onChange({ subheadline: e.target.value })}
          placeholder="Supporting text that explains your offer"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Primary CTA Label</Label>
          <Input
            value={block.ctaLabel ?? ''}
            onChange={(e) => onChange({ ctaLabel: e.target.value })}
            placeholder="Get Started"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Primary CTA URL</Label>
          <Input
            value={block.ctaUrl ?? ''}
            onChange={(e) => onChange({ ctaUrl: e.target.value })}
            placeholder="/contact"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Secondary CTA Label</Label>
          <Input
            value={block.ctaSecondaryLabel ?? ''}
            onChange={(e) => onChange({ ctaSecondaryLabel: e.target.value })}
            placeholder="Learn More"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Secondary CTA URL</Label>
          <Input
            value={block.ctaSecondaryUrl ?? ''}
            onChange={(e) => onChange({ ctaSecondaryUrl: e.target.value })}
            placeholder="#features"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Background Image URL</Label>
        <Input
          value={block.backgroundImage ?? ''}
          onChange={(e) => onChange({ backgroundImage: e.target.value })}
          placeholder="https://example.com/hero.jpg"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Min Height</Label>
          <Select
            value={block.minHeight ?? 'md'}
            onValueChange={(v) => onChange({ minHeight: v as any })}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Short (50vh)</SelectItem>
              <SelectItem value="md">Medium (70vh)</SelectItem>
              <SelectItem value="lg">Tall (90vh)</SelectItem>
              <SelectItem value="screen">Full Screen</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Text Color</Label>
          <Select
            value={block.textColor ?? 'light'}
            onValueChange={(v) => onChange({ textColor: v as any })}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light (white)</SelectItem>
              <SelectItem value="dark">Dark (black)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-xs">Dark Overlay</Label>
        <Switch
          checked={!!block.overlay}
          onCheckedChange={(v) => onChange({ overlay: v })}
        />
      </div>
    </div>
  );
}

// ── Preview ───────────────────────────────────────────────────────────────

const minHeightMap = {
  sm: 'min-h-[50vh]',
  md: 'min-h-[70vh]',
  lg: 'min-h-[90vh]',
  screen: 'min-h-screen',
};

export function HeroPreview({ block }: { block: BlockData & { type: 'hero' } }) {
  const textClass = block.textColor === 'dark' ? 'text-gray-900' : 'text-white';
  const minH = minHeightMap[block.minHeight ?? 'md'];

  return (
    <div
      className={cn(
        'relative flex items-center justify-center w-full',
        minH,
        !block.backgroundImage && 'bg-gradient-to-br from-gray-900 to-gray-700'
      )}
      style={
        block.backgroundImage
          ? { backgroundImage: `url(${block.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : undefined
      }
    >
      {block.overlay && (
        <div className="absolute inset-0 bg-black/50" />
      )}
      <div className={cn('relative z-10 text-center max-w-3xl mx-auto px-6 space-y-6', textClass)}>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          {block.headline || 'Your Headline Here'}
        </h1>
        {block.subheadline && (
          <p className="text-lg md:text-xl opacity-90">{block.subheadline}</p>
        )}
        {(block.ctaLabel || block.ctaSecondaryLabel) && (
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {block.ctaLabel && (
              <a
                href={block.ctaUrl || '#'}
                className="inline-flex items-center px-6 py-3 rounded-lg bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors"
              >
                {block.ctaLabel}
              </a>
            )}
            {block.ctaSecondaryLabel && (
              <a
                href={block.ctaSecondaryUrl || '#'}
                className="inline-flex items-center px-6 py-3 rounded-lg border-2 border-current font-semibold hover:bg-white/10 transition-colors"
              >
                {block.ctaSecondaryLabel}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
