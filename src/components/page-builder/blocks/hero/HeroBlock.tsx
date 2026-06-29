'use client';

import { type BlockData } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HeroSection } from '@/components/home/HeroSection';

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
// Pixel-perfect: renders the real <HeroSection> from src/components/home so a
// block dropped on the canvas looks identical to the live home page. Falsy
// values pass through as undefined so HeroSection's built-in defaults apply.

export function HeroPreview({ block }: { block: BlockData & { type: 'hero' } }) {
  return (
    <HeroSection
      headline={block.headline || undefined}
      subheadline={block.subheadline || undefined}
      primaryCtaLabel={block.ctaLabel || undefined}
      primaryCtaUrl={block.ctaUrl || undefined}
      secondaryCtaLabel={block.ctaSecondaryLabel || undefined}
      secondaryCtaUrl={block.ctaSecondaryUrl || undefined}
      imageUrl={block.backgroundImage || undefined}
    />
  );
}
