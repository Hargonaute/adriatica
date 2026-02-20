'use client';

import React from 'react';
import { type BlockData } from '@/types';
import { BLOCKS_REGISTRY } from './blocks/registry';
import { cn } from '@/lib/utils';

// Helper to map BaseBlockSettings to Tailwind classes
function getBaseClasses(data: BlockData) {
  const classes = [];

  // Padding Top
  const pt = {
    'none': 'pt-0',
    'sm': 'pt-4',
    'md': 'pt-8',
    'lg': 'pt-16',
    'xl': 'pt-24',
  }[data.paddingTop || 'md'];
  classes.push(pt);

  // Padding Bottom
  const pb = {
    'none': 'pb-0',
    'sm': 'pb-4',
    'md': 'pb-8',
    'lg': 'pb-16',
    'xl': 'pb-24',
  }[data.paddingBottom || 'md'];
  classes.push(pb);

  // Background
  const bg = {
    'none': 'bg-transparent',
    'muted': 'bg-muted',
    'dark': 'bg-foreground text-background',
    'image': 'bg-cover bg-center', // Requires handling styled prop for image url if needed
  }[data.background || 'none'];
  classes.push(bg);

  // Mobile visibility
  if (data.hideOnMobile) {
    classes.push('hidden md:block');
  }

  return classes.join(' ');
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
  const registryEntry = BLOCKS_REGISTRY[block.type];

  if (!registryEntry) {
    return null; // Don't render unknown blocks in preview/production
  }

  const { Preview } = registryEntry;

  const sectionClasses = getBaseClasses(block.data);
  const containerClasses = getWrapperClasses(block.data);

  return (
    <section className={sectionClasses}>
        <div className={containerClasses}>
             <Preview block={block.data} />
        </div>
    </section>
  );
}
