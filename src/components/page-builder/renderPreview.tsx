'use client';

import React from 'react';
import { type BlockData, type ContainerBlockData, type RepeaterBlockData } from '@/types';
import { BLOCKS_REGISTRY } from './blocks/registry';
import { ContainerPreview } from './blocks/container/ContainerBlock';
import { RepeaterPreview } from './blocks/repeater/RepeaterBlock';

// ── Style tables ──────────────────────────────────────────────────────────
// Kept in sync with the previous Tailwind mapping so the rendered output is
// visually identical — only the implementation switched from utility classes
// to inline CSS.

const PADDING_MAP: Record<string, string> = {
  none: '0',
  sm: '2rem',   // matches pt-8 / pb-8
  md: '4rem',   // matches pt-16 / pb-16
  lg: '6rem',   // matches pt-24 / pb-24
  xl: '8rem',   // matches pt-32 / pb-32
};

const MAX_WIDTH_MAP: Record<string, string> = {
  sm: '640px',   // max-w-screen-sm
  md: '768px',   // max-w-screen-md
  lg: '1024px',  // max-w-screen-lg
  full: '100%',
};

const ALIGN_MAP: Record<string, React.CSSProperties['textAlign']> = {
  left: 'left',
  center: 'center',
  right: 'right',
};

const BACKGROUND_STYLE: Record<string, React.CSSProperties> = {
  none: {},
  muted: { backgroundColor: 'var(--muted)' },
  dark: { backgroundColor: 'var(--foreground)', color: 'var(--background)' },
  // Sizing/positioning only — image URL is supplied via customClassName or
  // baseStyles.background as before.
  image: { backgroundSize: 'cover', backgroundPosition: 'center' },
  'brand-red': { backgroundColor: '#BC0D2A', color: '#ffffff' },
  'brand-green': { backgroundColor: '#328542', color: '#ffffff' },
  navy: { backgroundColor: '#0b0f19', color: '#ffffff' },
};

// Section-level base styles: padding + background. Text align lives on the
// wrapper below because it targets inline-flow content, not the section box.
function getSectionStyle(data: BlockData): React.CSSProperties {
  return {
    paddingTop: PADDING_MAP[data.paddingTop || 'md'],
    paddingBottom: PADDING_MAP[data.paddingBottom || 'md'],
    ...(BACKGROUND_STYLE[data.background || 'none'] ?? {}),
  };
}

// Centred inner wrapper — replaces `mx-auto px-4 max-w-… text-…`.
function getWrapperStyle(data: BlockData): React.CSSProperties {
  return {
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    maxWidth: MAX_WIDTH_MAP[data.maxWidth || 'full'],
    textAlign: ALIGN_MAP[data.align || 'left'],
  };
}

// Maps Task-6 typography / border / layout / media fields onto inline CSS.
// Enum values (e.g. fontSize='lg', gap='md') resolve via a lookup table;
// bare numeric values get "px" appended; values with an explicit unit
// (rem/em/%/px/...) pass through untouched; empty / undefined → omitted.
function getBaseStyles(data: BlockData): React.CSSProperties {
  const styles: React.CSSProperties = {};

  const fontSizeMap: Record<string, string> = {
    xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem',
    xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem',
  };
  const fontWeightMap: Record<string, string> = {
    normal: '400', medium: '500', semibold: '600', bold: '700',
  };
  const borderRadiusMap: Record<string, string> = {
    none: '0', sm: '0.125rem', md: '0.375rem', lg: '0.5rem', full: '9999px',
  };
  const spaceMap: Record<string, string> = {
    none: '0', sm: '0.5rem', md: '1rem', lg: '2rem', xl: '3rem',
  };
  const aspectRatioMap: Record<string, string> = {
    auto: 'auto', square: '1 / 1', video: '16 / 9', portrait: '3 / 4',
    '1:1': '1 / 1', '4:3': '4 / 3', '16:9': '16 / 9', '3:4': '3 / 4',
  };
  const alignItemsMap: Record<string, string> = {
    start: 'flex-start', end: 'flex-end', center: 'center', stretch: 'stretch', baseline: 'baseline',
  };
  const justifyContentMap: Record<string, string> = {
    start: 'flex-start', end: 'flex-end', center: 'center',
    between: 'space-between', around: 'space-around', evenly: 'space-evenly',
  };

  const size = (value: unknown, enumMap?: Record<string, string>): string | undefined => {
    if (value == null || value === '') return undefined;
    const str = String(value);
    if (enumMap && Object.prototype.hasOwnProperty.call(enumMap, str)) return enumMap[str];
    if (/^-?\d*\.?\d+$/.test(str)) return `${str}px`;
    return str;
  };

  const passthrough = (value: unknown): string | undefined => {
    if (value == null) return undefined;
    const str = String(value).trim();
    return str === '' ? undefined : str;
  };

  const d = data as Record<string, unknown>;

  // Typography
  const fontSize = size(d.fontSize, fontSizeMap);
  if (fontSize) styles.fontSize = fontSize;
  const fontWeight = d.fontWeight ? (fontWeightMap[String(d.fontWeight)] ?? String(d.fontWeight)) : undefined;
  if (fontWeight) styles.fontWeight = fontWeight;
  const textAlign = passthrough(d.textAlign ?? d.align);
  if (textAlign) styles.textAlign = textAlign as React.CSSProperties['textAlign'];
  const color = passthrough(d.textColor);
  if (color) styles.color = color;
  const textTransform = passthrough(d.textTransform);
  if (textTransform && textTransform !== 'none') {
    styles.textTransform = textTransform as React.CSSProperties['textTransform'];
  }

  // Background
  const backgroundColor = passthrough(d.backgroundColor);
  if (backgroundColor) styles.backgroundColor = backgroundColor;

  // Border (only emit width + style when non-zero so a stray '0' doesn't draw a border)
  const borderWidth = size(d.borderWidth);
  if (borderWidth && borderWidth !== '0' && borderWidth !== '0px') {
    styles.borderWidth = borderWidth;
    styles.borderStyle = 'solid';
  }
  const borderRadius = size(d.borderRadius, borderRadiusMap);
  if (borderRadius && borderRadius !== '0') styles.borderRadius = borderRadius;
  const borderColor = passthrough(d.borderColor);
  if (borderColor) styles.borderColor = borderColor;

  // Spacing
  const padding = size(d.padding, spaceMap);
  if (padding) styles.padding = padding;
  const margin = size(d.margin, spaceMap);
  if (margin) styles.margin = margin;
  const gap = size(d.gap, spaceMap);
  if (gap && gap !== '0') styles.gap = gap;

  // Flex / grid
  const flexDirection = passthrough(d.flexDirection ?? d.direction);
  if (flexDirection) styles.flexDirection = flexDirection as React.CSSProperties['flexDirection'];
  const alignItems = passthrough(d.alignItems);
  if (alignItems) styles.alignItems = (alignItemsMap[alignItems] ?? alignItems) as React.CSSProperties['alignItems'];
  const justifyContent = passthrough(d.justifyContent);
  if (justifyContent) styles.justifyContent = (justifyContentMap[justifyContent] ?? justifyContent) as React.CSSProperties['justifyContent'];

  // Media
  const aspectRatio = passthrough(d.aspectRatio);
  if (aspectRatio && aspectRatio !== 'auto') {
    styles.aspectRatio = aspectRatioMap[aspectRatio] ?? aspectRatio;
  }
  const objectFit = passthrough(d.objectFit);
  if (objectFit) styles.objectFit = objectFit as React.CSSProperties['objectFit'];

  return styles;
}

// Scoped CSS injected only when `hideOnMobile` is set. Two independent gates
// mirror the previous Tailwind combo (`hidden md:block @max-3xl/preview:!hidden`):
//   - viewport media query < 768px hides on the live site;
//   - container query < 768px hides inside the editor's preview viewport
//     wrapper (which declares `@container/preview`), so the mobile toggle in
//     the editor still visually collapses the block.
function HideOnMobileStyle({ id }: { id: string }) {
  const safeId = id.replace(/"/g, '\\"');
  const css = `
    @media (max-width: 767.98px) {
      section[data-block-id="${safeId}"] { display: none !important; }
    }
    @container preview (max-width: 767.98px) {
      section[data-block-id="${safeId}"] { display: none !important; }
    }
  `;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

interface RenderPreviewProps {
  block: { id: string; type: string; data: BlockData };
}

export function RenderPreview({ block }: RenderPreviewProps) {
  const data = block.data;
  const sectionStyle: React.CSSProperties = {
    ...getSectionStyle(data),
    ...getBaseStyles(data),
  };
  const wrapperStyle = getWrapperStyle(data);

  // customClassName is user-authored freeform — pass through untouched.
  const customClass = data.customClassName || undefined;

  const sectionProps = {
    'data-block-id': block.id,
    'data-reveal': '',
    className: customClass,
    style: sectionStyle,
  } as const;

  // Container is handled outside the registry to avoid circular imports
  if (block.type === 'container') {
    return (
      <>
        {data.hideOnMobile && <HideOnMobileStyle id={block.id} />}
        <section {...sectionProps}>
          <div style={wrapperStyle}>
            <ContainerPreview block={block.data as ContainerBlockData} />
          </div>
        </section>
      </>
    );
  }

  // Repeater is handled outside the registry to avoid circular imports
  if (block.type === 'repeater') {
    return (
      <>
        {data.hideOnMobile && <HideOnMobileStyle id={block.id} />}
        <section {...sectionProps}>
          <div style={wrapperStyle}>
            <RepeaterPreview block={block.data as RepeaterBlockData} />
          </div>
        </section>
      </>
    );
  }

  const registryEntry = BLOCKS_REGISTRY[block.type];

  if (!registryEntry) {
    return null; // Don't render unknown blocks in preview/production
  }

  const { Preview } = registryEntry;

  return (
    <>
      {data.hideOnMobile && <HideOnMobileStyle id={block.id} />}
      <section {...sectionProps}>
        <div style={wrapperStyle}>
          <Preview block={block.data} />
        </div>
      </section>
    </>
  );
}
