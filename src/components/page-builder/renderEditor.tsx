'use client';

import React from 'react';
import { type BlockData } from '@/types';
import { BLOCKS_REGISTRY } from './blocks/registry';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, GripVertical, Copy } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface RenderEditorProps {
  block: { id: string; type: string; data: BlockData; order: number };
  onChange: (id: string, data: Partial<BlockData>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  isOverlay?: boolean;
}

export function RenderEditor({ block, onChange, onRemove, onDuplicate, isOverlay }: RenderEditorProps) {
  const registryEntry = BLOCKS_REGISTRY[block.type];

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  if (!registryEntry) {
    return (
      <Card className="border-destructive" ref={setNodeRef} style={style} {...attributes}>
        <CardContent className="p-4 text-destructive text-sm">
          Unknown block type: <code>{block.type}</code>
        </CardContent>
      </Card>
    );
  }

  const { Editor, label, icon: Icon } = registryEntry;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn('group relative', isOverlay && 'shadow-xl bg-background rotate-2 cursor-grabbing')}
    >
      <CardHeader className="p-3 flex flex-row items-center justify-between space-y-0 bg-muted/30 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="cursor-grab active:cursor-grabbing hover:bg-muted h-7 w-7"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Icon className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">{label}</span>
        </div>

        <div className="flex items-center gap-1">
          <Badge
            variant="outline"
            className="text-xs font-mono text-muted-foreground hidden group-hover:inline-flex"
          >
            {block.type}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            title="Duplicate block"
            onClick={() => onDuplicate(block.id)}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            title="Remove block"
            onClick={() => onRemove(block.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <Editor block={block.data} onChange={(updates) => onChange(block.id, updates)} />
      </CardContent>
    </Card>
  );
}
