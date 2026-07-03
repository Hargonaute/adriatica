'use client';

import React from 'react';
import { CollectionItemContext, type CollectionItemCtx } from '@/contexts/CollectionItemContext';
import { RenderPreview } from '@/components/page-builder/renderPreview';
import { type Block } from '@/types';

interface Props {
  blocks: Block[];
  ctx: CollectionItemCtx;
}

export function TemplateRenderer({ blocks, ctx }: Props) {
  return (
    <CollectionItemContext.Provider value={ctx}>
      <main className="min-h-screen bg-background">
        {blocks.map(block => (
          <RenderPreview key={block.id} block={block} />
        ))}
      </main>
    </CollectionItemContext.Provider>
  );
}
