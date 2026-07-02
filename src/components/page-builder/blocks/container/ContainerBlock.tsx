'use client';

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  SortableContext,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Copy, Plus, LayoutTemplate } from 'lucide-react';
import { type ContainerBlockData, type Block, type BlockData } from '@/types';
import { BLOCKS_REGISTRY, type BlockType } from '../registry';
import { createBlock } from '../createBlock';
import { useEditorContext } from '../../EditorContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// ── Constants ───────────────────────────────────────────────────────────────

const GAP_MAP: Record<string, string> = {
  none: '0',
  sm: '8px',
  md: '16px',
  lg: '32px',
};

const PADDING_MAP: Record<string, string> = {
  none: '0',
  sm: '8px',
  md: '16px',
  lg: '32px',
};

const BORDER_RADIUS_MAP: Record<string, string> = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '16px',
  full: '9999px',
};

// Block types that can be added as container children.
// Excludes full-page sections (hero, newsletter, contact-form)
// and container itself (no nested containers in v1).
const CHILD_BLOCK_TYPES: BlockType[] = [
  'rich-text',
  'image',
  'video',
  'spacer',
  'cta',
  'bound-text',
  'bound-image',
  'bound-rich-text',
  'bound-date',
];

// ── Factory ─────────────────────────────────────────────────────────────────

export function createContainerBlock(order: number): Block {
  return {
    id: uuidv4(),
    type: 'container',
    order,
    data: {
      type: 'container',
      direction: 'column',
      layout: 'stack',
      mobileBehavior: 'stack',
      containerGap: 'md',
      containerPadding: 'none',
      paddingTop: 'md',
      paddingBottom: 'md',
      align: 'left',
      maxWidth: 'full',
      background: 'none',
      hideOnMobile: false,
      alignItems: 'stretch',
      children: [],
    } as ContainerBlockData,
  };
}

// ── Sortable child wrapper ───────────────────────────────────────────────────

interface SortableChildProps {
  child: Block;
  onUpdate: (id: string, updates: Partial<BlockData>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
}

function SortableChild({ child, onUpdate, onRemove, onDuplicate }: SortableChildProps) {
  const { setSelectedBlockId, selectedBlockId } = useEditorContext();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: child.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isSelected = selectedBlockId === child.id;
  const registryEntry = BLOCKS_REGISTRY[child.type];

  if (!registryEntry) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="rounded border border-destructive p-2 text-xs text-destructive"
      >
        Unknown block: <code>{child.type}</code>
      </div>
    );
  }

  const { Editor, label, icon: Icon } = registryEntry;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-lg border bg-background shadow-sm transition-shadow',
        isSelected && 'ring-2 ring-[#BC0D2A]',
        isDragging && 'shadow-lg',
      )}
      onClick={(e) => { e.stopPropagation(); setSelectedBlockId(child.id); }}
    >
      {/* Mini block header */}
      <div className="flex items-center justify-between px-2 py-1.5 bg-muted/30 rounded-t-lg border-b">
        <div className="flex items-center gap-1.5">
          <button
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
            title="Drag to reorder"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-3 w-3 text-muted-foreground" />
          </button>
          <Icon className="h-3 w-3 text-primary" />
          <span className="text-xs font-medium">{label}</span>
        </div>
        <div className="flex gap-0.5">
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(child.id); }}
            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
            title="Duplicate"
          >
            <Copy className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(child.id); }}
            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-destructive"
            title="Remove"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Block editor content */}
      <div className="p-3">
        <Editor
          block={child.data as any}
          onChange={(updates: Partial<BlockData>) => onUpdate(child.id, updates)}
        />
      </div>
    </div>
  );
}

// ── Add child popover ────────────────────────────────────────────────────────

function AddChildButton({ onAdd }: { onAdd: (type: BlockType) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1 mt-2 w-full border-dashed"
          onClick={(e) => e.stopPropagation()}
        >
          <Plus className="h-3 w-3" />
          Add block
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-52 p-2"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-0.5">
          {CHILD_BLOCK_TYPES.map((type) => {
            const entry = BLOCKS_REGISTRY[type];
            if (!entry) return null;
            const Icon = entry.icon;
            return (
              <button
                key={type}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted text-left"
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd(type);
                  setOpen(false);
                }}
              >
                <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs">{entry.label}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ── Container editor card (used by Editor.tsx directly) ─────────────────────

interface ContainerEditorCardProps {
  block: { id: string; type: string; data: ContainerBlockData; order: number };
  onChange: (id: string, updates: Partial<BlockData>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  isOverlay?: boolean;
}

export function ContainerEditorCard({
  block,
  onChange,
  onRemove,
  onDuplicate,
  isOverlay,
}: ContainerEditorCardProps) {
  const { setSelectedBlockId } = useEditorContext();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const data = block.data;
  const direction = data.direction ?? 'column';
  const children = data.children ?? [];

  const updateChild = (childId: string, updates: Partial<BlockData>) => {
    onChange(block.id, {
      children: children.map((c) =>
        c.id === childId ? { ...c, data: { ...c.data, ...updates } } : c
      ),
    } as Partial<BlockData>);
  };

  const removeChild = (childId: string) => {
    onChange(block.id, {
      children: children.filter((c) => c.id !== childId),
    } as Partial<BlockData>);
    setSelectedBlockId(null);
  };

  const duplicateChild = (childId: string) => {
    const idx = children.findIndex((c) => c.id === childId);
    if (idx === -1) return;
    const copy: Block = { ...children[idx], id: uuidv4(), order: idx + 1 };
    const newChildren = [
      ...children.slice(0, idx + 1),
      copy,
      ...children.slice(idx + 1),
    ].map((c, i) => ({ ...c, order: i }));
    onChange(block.id, { children: newChildren } as Partial<BlockData>);
    setSelectedBlockId(copy.id);
  };

  const addChild = (type: BlockType) => {
    const newBlock = createBlock(type, children.length);
    onChange(block.id, { children: [...children, newBlock] } as Partial<BlockData>);
    setSelectedBlockId(newBlock.id);
  };

  const strategy =
    direction === 'row' ? horizontalListSortingStrategy : verticalListSortingStrategy;

  // When used as a DragOverlay, render a simplified placeholder
  if (isOverlay) {
    return (
      <Card className="shadow-xl bg-background rotate-2 cursor-grabbing opacity-90">
        <CardHeader className="p-3 flex flex-row items-center gap-2 space-y-0 bg-muted/30 rounded-t-lg">
          <LayoutTemplate className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Container</span>
          <Badge variant="outline" className="text-xs">
            {direction} · {children.length} {children.length === 1 ? 'child' : 'children'}
          </Badge>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="group relative"
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
          <LayoutTemplate className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Container</span>
          <Badge
            variant="outline"
            className="text-xs font-mono text-muted-foreground hidden group-hover:inline-flex"
          >
            {direction} · {children.length} {children.length === 1 ? 'child' : 'children'}
          </Badge>
        </div>

        <div className="flex items-center gap-1">
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
        <SortableContext items={children.map((c) => c.id)} strategy={strategy}>
          <div
            className={cn(
              'min-h-[64px] rounded-md border-2 border-dashed border-slate-200 dark:border-slate-700 p-2',
              direction === 'row' ? 'flex flex-row flex-wrap' : 'flex flex-col',
              'gap-2',
            )}
          >
            {children.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground py-4">
                No blocks yet — use "Add block" below.
              </div>
            ) : (
              children.map((child) => (
                <div
                  key={child.id}
                  className={cn(direction === 'row' && 'flex-1 min-w-[160px]')}
                >
                  <SortableChild
                    child={child}
                    onUpdate={updateChild}
                    onRemove={removeChild}
                    onDuplicate={duplicateChild}
                  />
                </div>
              ))
            )}
          </div>
        </SortableContext>

        <AddChildButton onAdd={addChild} />
      </CardContent>
    </Card>
  );
}

// ── Container preview (used by renderPreview.tsx) ────────────────────────────

// Resolves layout preset into base flex/grid styles.
// 'stack' → falls back to the block's own direction (existing behaviour).
function getLayoutStyles(
  layout: NonNullable<ContainerBlockData['layout']>,
  direction: ContainerBlockData['direction']
): React.CSSProperties {
  switch (layout) {
    case 'two-col-text-image':
      return { display: 'flex', flexDirection: 'row' };
    case 'two-col-image-text':
      return { display: 'flex', flexDirection: 'row-reverse' };
    case 'three-col':
      return { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' };
    case 'stack':
    default:
      return { display: 'flex', flexDirection: direction };
  }
}

export function ContainerPreview({ block }: { block: ContainerBlockData }) {
  const children = block.children ?? [];
  const direction = block.direction ?? 'column';
  const layout = block.layout ?? 'stack';
  const mobileBehavior = block.mobileBehavior ?? 'stack';

  const layoutStyles = getLayoutStyles(layout, direction);
  const isMultiColumn = layout !== 'stack';

  const containerStyle: React.CSSProperties = {
    ...layoutStyles,
    gap: GAP_MAP[block.containerGap ?? 'none'],
    padding: PADDING_MAP[block.containerPadding ?? 'none'],
    backgroundColor: block.backgroundColor || undefined,
    borderRadius: BORDER_RADIUS_MAP[block.borderRadius ?? 'none'],
    alignItems: block.alignItems ?? 'stretch',
    ...(block.borderWidth && block.borderWidth !== '0'
      ? {
          borderWidth: `${block.borderWidth}px`,
          borderStyle: 'solid',
          borderColor: block.borderColor || 'var(--border)',
        }
      : {}),
  };

  // Below 768px: stack → force column / one-column grid; hide → display: none.
  // 'same' leaves the desktop layout untouched.
  //
  // We emit BOTH viewport-based (`max-md:*`) and container-query-based
  // (`@max-3xl/preview:*`) variants so the rule fires:
  //   • on the live site — where the viewport width drives responsiveness, and
  //   • inside the editor's Preview viewport container — where the wrapper is
  //     an `@container/preview` narrower than the browser viewport, so plain
  //     `max-md:*` wouldn't trigger when the user selects Tablet/Mobile.
  const mobileClass = cn(
    mobileBehavior === 'hide' && 'max-md:hidden @max-3xl/preview:hidden',
    mobileBehavior === 'stack' &&
      isMultiColumn &&
      'max-md:!flex max-md:!flex-col max-md:![grid-template-columns:1fr] @max-3xl/preview:!flex @max-3xl/preview:!flex-col @max-3xl/preview:![grid-template-columns:1fr]',
  );

  return (
    <div style={containerStyle} className={mobileClass || undefined}>
      {children.map((child) => {
        const registryEntry = BLOCKS_REGISTRY[child.type];
        if (!registryEntry) return null;
        const { Preview } = registryEntry;
        return <Preview key={child.id} block={child.data as any} />;
      })}
    </div>
  );
}
