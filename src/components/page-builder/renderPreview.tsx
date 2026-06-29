'use client';

import React from 'react';
import { type BlockData, type ContainerBlockData, type RepeaterBlockData } from '@/types';
import { BLOCKS_REGISTRY } from './blocks/registry';
import { ContainerPreview } from './blocks/container/ContainerBlock';
import { RepeaterPreview } from './blocks/repeater/RepeaterBlock';
import { cn } from '@/lib/utils';

// Helper to map BaseBlockSettings to Tailwind classes
function getBaseClasses(data: BlockData) {
  const classes = [];

  // Padding Top — scale shifted so the default ('md') is py-16, the shared
  // section rhythm. 'sm' still reads as small, 'lg'/'xl' as more generous.
  const pt = {
    'none': 'pt-0',
    'sm': 'pt-8',
    'md': 'pt-16',
    'lg': 'pt-24',
    'xl': 'pt-32',
  }[data.paddingTop || 'md'];
  classes.push(pt);

  // Padding Bottom
  const pb = {
    'none': 'pb-0',
    'sm': 'pb-8',
    'md': 'pb-16',
    'lg': 'pb-24',
    'xl': 'pb-32',
  }[data.paddingBottom || 'md'];
  classes.push(pb);

  // Background
  const bg = {
    'none': 'bg-transparent',
    'muted': 'bg-muted',
    'dark': 'bg-foreground text-background',
    'image': 'bg-cover bg-center',
    'brand-red': 'bg-[#BC0D2A] text-white',
    'brand-green': 'bg-[#328542] text-white',
    'navy': 'bg-[#0b0f19] text-white',
  }[data.background || 'none'] ?? 'bg-transparent';
  classes.push(bg);

  // Mobile visibility
  if (data.hideOnMobile) {
    classes.push('hidden md:block');
  }

  return classes.join(' ');
}

// Maps Task-6 typography / border / layout / media fields onto inline CSS.
// Enum values (e.g. fontSize='lg', gap='md') resolve via a lookup table;
// bare numeric values get "px" appended; values with an explicit unit
// (rem/em/%/px/...) pass through untouched; empty / undefined → omitted.
function getBaseStyles(data: BlockData): React.CSSProperties {
  const styles: React.CSSProperties = {};

  const fontSizeMap: Record<string, string> = {
    sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem',
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
  };
  const alignItemsMap: Record<string, string> = {
    start: 'flex-start', end: 'flex-end', center: 'center', stretch: 'stretch', baseline: 'baseline',
  };
  const justifyContentMap: Record<string, string> = {
    start: 'flex-start', end: 'flex-end', center: 'center',
    between: 'space-between', around: 'space-around', evenly: 'space-evenly',
  };

  // Resolve a size: enum match → mapped, bare number → "Npx", string with
  // a unit → pass through, empty / null → undefined.
  const size = (value: unknown, enumMap?: Record<string, string>): string | undefined => {
    if (value == null || value === '') return undefined;
    const str = String(value);
    if (enumMap && Object.prototype.hasOwnProperty.call(enumMap, str)) return enumMap[str];
    if (/^-?\d*\.?\d+$/.test(str)) return `${str}px`;
    return str;
  };

  // Trim and reject empties; pass-through for arbitrary CSS strings (colors, etc.).
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

// Helper for alignment and max-width wrapper
function getWrapperClasses(data: BlockData) {
    const classes = ['mx-auto', 'px-4']; // default container padding
    
    // Max Width
    const mw = {
        'sm': 'max-w-screen-sm',
        'md': 'max-w-screen-md',
        'lg': 'max-w-screen-lg',
        'full': 'max-w-full',
    }[data.maxWidth || 'full'];
    classes.push(mw);

    // Alignment (Text align mostly, but could handle flex alignment)
    const align = {
        'left': 'text-left',
        'center': 'text-center',
        'right': 'text-right',
    }[data.align || 'left'];
    classes.push(align);

    if (data.customClassName) {
        classes.push(data.customClassName);
    }
    
    return classes.join(' ');
}

interface RenderPreviewProps {
  block: { id: string; type: string; data: BlockData };
}

export function RenderPreview({ block }: RenderPreviewProps) {
  const sectionClasses = getBaseClasses(block.data);
  const containerClasses = getWrapperClasses(block.data);
  const baseStyles = getBaseStyles(block.data);

  // Container is handled outside the registry to avoid circular imports
  if (block.type === 'container') {
    return (
      <section className={sectionClasses} style={baseStyles}>
        <div className={containerClasses}>
          <ContainerPreview block={block.data as ContainerBlockData} />
        </div>
      </section>
    );
  }

  // Repeater is handled outside the registry to avoid circular imports
  if (block.type === 'repeater') {
    return (
      <section className={sectionClasses} style={baseStyles}>
        <div className={containerClasses}>
          <RepeaterPreview block={block.data as RepeaterBlockData} />
        </div>
      </section>
    );
  }

  const registryEntry = BLOCKS_REGISTRY[block.type];

  if (!registryEntry) {
    return null; // Don't render unknown blocks in preview/production
  }

  const { Preview } = registryEntry;

  return (
    <section className={sectionClasses} style={baseStyles}>
        <div className={containerClasses}>
             <Preview block={block.data} />
        </div>
    </section>
  );
}
