'use client';

import React from 'react';
import { BLOCKS_REGISTRY, type BlockType } from './blocks/registry';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BlockSelectorProps {
  onAdd: (type: BlockType) => void;
  className?: string;
}

export function BlockSelector({ onAdd, className }: BlockSelectorProps) {
  return (
    <div className={className}>
      <div className="p-4 border-b">
        <h3 className="font-semibold tracking-tight">Add Block</h3>
        <p className="text-xs text-muted-foreground">Click to append to page</p>
      </div>
      <ScrollArea className="h-[calc(100vh-100px)]">
         <div className="p-4 grid gap-2">
            {Object.values(BLOCKS_REGISTRY).map((block) => {
               const Icon = block.icon;
               return (
                 <Button
                    key={block.type}
                    variant="outline"
                    className="justify-start h-auto py-3 px-4 w-full"
                    onClick={() => onAdd(block.type as BlockType)}
                 >
                    <Icon className="mr-3 h-5 w-5 text-muted-foreground" />
                    <div className="flex flex-col items-start">
                        <span className="font-medium text-sm">{block.label}</span>
                        <span className="text-xs text-muted-foreground font-normal">
                           {block.description}
                        </span>
                    </div>
                 </Button>
               );
            })}
         </div>
      </ScrollArea>
    </div>
  );
}
