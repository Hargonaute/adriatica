'use client';

import { type BlockData } from '@/types';

type SpacerBlock = BlockData & { type: 'spacer' };

// New spec — halved vs. the pre-divider scale. See SpacerBlockData in types.ts.
export const SPACER_SIZE_PX: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number> = {
  xs: 8,
  sm: 16,
  md: 32,
  lg: 64,
  xl: 96,
};

export const SPACER_SIZE_LABEL: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', string> = {
  xs: 'XS — 8px',
  sm: 'SM — 16px',
  md: 'MD — 32px',
  lg: 'LG — 64px',
  xl: 'XL — 96px',
};

// `size` supersedes the legacy `height` field. Fall back to it so blocks saved
// before T07 keep the same enum value they had.
export function resolveSpacerSize(block: SpacerBlock): 'xs' | 'sm' | 'md' | 'lg' | 'xl' {
  return (block.size ?? block.height ?? 'md') as 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

// ── Editor ────────────────────────────────────────────────────────────────

export function SpacerEditor({ block }: { block: SpacerBlock; onChange: (updates: Partial<BlockData>) => void }) {
  const size = resolveSpacerSize(block);
  const px = SPACER_SIZE_PX[size];
  const showDivider = !!block.showDivider;

  return (
    <div className="p-4 border rounded-md">
      <div
        className="relative w-full border-2 border-dashed border-muted rounded flex items-center justify-center text-xs text-muted-foreground"
        style={{ height: `${Math.max(px, 24)}px` }}
      >
        <span className="relative z-10 bg-white/80 dark:bg-slate-950/80 px-2 rounded">
          Spacer — {SPACER_SIZE_LABEL[size]}
          {showDivider ? ' + Divider' : ''}
        </span>
        {showDivider && (
          <hr
            className="absolute inset-x-4 top-1/2 -translate-y-1/2 border-0 border-t"
            style={{
              borderTopWidth: '1px',
              borderTopStyle: (block.dividerStyle ?? 'solid') as 'solid' | 'dashed' | 'dotted',
              borderTopColor: block.dividerColor?.trim() || 'rgba(0,0,0,0.2)',
            }}
          />
        )}
      </div>
    </div>
  );
}

// ── Preview ───────────────────────────────────────────────────────────────

export function SpacerPreview({ block }: { block: SpacerBlock }) {
  const size = resolveSpacerSize(block);
  const px = SPACER_SIZE_PX[size];
  const showDivider = !!block.showDivider;

  if (!showDivider) {
    return <div aria-hidden="true" style={{ height: `${px}px` }} />;
  }

  return (
    <div
      aria-hidden="true"
      style={{
        height: `${px}px`,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <hr
        style={{
          width: '100%',
          margin: 0,
          borderTopWidth: '1px',
          borderTopStyle: (block.dividerStyle ?? 'solid') as 'solid' | 'dashed' | 'dotted',
          borderTopColor: block.dividerColor?.trim() || 'rgba(0,0,0,0.2)',
          borderRight: 'none',
          borderBottom: 'none',
          borderLeft: 'none',
        }}
      />
    </div>
  );
}
