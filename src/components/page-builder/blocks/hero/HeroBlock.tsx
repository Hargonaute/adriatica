'use client';

import { type BlockData } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HeroSection } from '@/components/home/HeroSection';
import { AssetPicker } from '../../AssetPicker';
import { Button } from '@/components/ui/button';
import { X, Image as ImageIcon } from 'lucide-react';

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
        <Label className="text-xs">Background Image</Label>
        {block.backgroundImage ? (
          <div className="relative aspect-video w-full rounded-md overflow-hidden border bg-muted group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={block.backgroundImage} alt="Background preview" className="w-full h-full object-cover" />
            <div className="absolute top-2 right-2 flex gap-2">
              <AssetPicker
                onSelect={(url) => onChange({ backgroundImage: url })}
                trigger={
                  <Button size="sm" variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    Change
                  </Button>
                }
              />
              <Button
                size="icon"
                variant="destructive"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onChange({ backgroundImage: '' })}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-24 border-2 border-dashed rounded-md flex flex-col items-center justify-center gap-2 text-muted-foreground bg-muted/20">
            <ImageIcon className="h-6 w-6 opacity-50" />
            <AssetPicker onSelect={(url) => onChange({ backgroundImage: url })} />
          </div>
        )}
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
      headline={block.headline || ''}
      subheadline={block.subheadline || ''}
      primaryCtaLabel={block.ctaLabel || ''}
      primaryCtaUrl={block.ctaUrl || '#'}
      secondaryCtaLabel={block.ctaSecondaryLabel || ''}
      secondaryCtaUrl={block.ctaSecondaryUrl || '#'}
      imageUrl={block.backgroundImage || ''}
      imageAlt=""
    />
  );
}
