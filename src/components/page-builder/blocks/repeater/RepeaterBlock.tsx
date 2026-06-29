'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Copy, Plus, Repeat2, LayoutTemplate } from 'lucide-react';
import {
  type RepeaterBlockData,
  type ContainerBlockData,
  type Block,
  type BlockData,
} from '@/types';
import { BLOCKS_REGISTRY, type BlockType } from '../registry';
import { createBlock } from '../createBlock';
import { ContainerEditorCard, ContainerPreview, createContainerBlock } from '../container/ContainerBlock';
import { RepeaterEntryContext } from '@/contexts/RepeaterEntryContext';
import { useEditorContext } from '../../EditorContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// ── Constants ─────────────────────────────────────────────────────────────────

const GAP_MAP: Record<string, string> = {
  sm: '12px',
  md: '24px',
  lg: '48px',
};

const COL_MAP: Record<string, number> = {
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
};

// Block types that can be added as card template children.
// Containers are included so the user can lay out the card with flex rows.
const CARD_TEMPLATE_TYPES: Array<{ type: string; label: string; icon: React.ElementType }> = [
  { type: 'container', label: 'Container', icon: LayoutTemplate },
  ...(['bound-text', 'bound-image', 'bound-rich-text', 'bound-date', 'rich-text', 'image', 'spacer'] as BlockType[])
    .map((t) => {
      const e = BLOCKS_REGISTRY[t];
      return e ? { type: t, label: e.label, icon: e.icon } : null;
    })
    .filter(Boolean) as Array<{ type: string; label: string; icon: React.ElementType }>,
];

// ── Factory ───────────────────────────────────────────────────────────────────

export function createRepeaterBlock(order: number): Block {
  return {
    id: uuidv4(),
    type: 'repeater',
    order,
    data: {
      type: 'repeater',
      columns: '3',
      repeaterGap: 'md',
      cardTemplate: [],
      paddingTop: 'md',
      paddingBottom: 'md',
      align: 'left',
      maxWidth: 'full',
      background: 'none',
    } as RepeaterBlockData,
  };
}

// ── Sortable card child (non-container registry blocks in the card template) ──

interface SortableCardChildProps {
  child: Block;
  onUpdate: (id: string, updates: Partial<BlockData>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
}

function SortableCardChild({ child, onUpdate, onRemove, onDuplicate }: SortableCardChildProps) {
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
      <div ref={setNodeRef} style={style} className="rounded border border-destructive p-2 text-xs text-destructive">
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
      <div className="p-3">
        <Editor
          block={child.data as any}
          onChange={(updates: Partial<BlockData>) => onUpdate(child.id, updates)}
        />
      </div>
    </div>
  );
}

// ── Add card block popover ─────────────────────────────────────────────────────

function AddCardBlockButton({ onAdd }: { onAdd: (type: string) => void }) {
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
          Add to card
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-2" align="start" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-0.5">
          {CARD_TEMPLATE_TYPES.map(({ type, label, icon: Icon }) => (
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
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ── RepeaterEditorCard (used by Editor.tsx directly) ──────────────────────────

interface RepeaterEditorCardProps {
  block: { id: string; type: string; data: RepeaterBlockData; order: number };
  onChange: (id: string, updates: Partial<BlockData>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  isOverlay?: boolean;
}

export function RepeaterEditorCard({
  block,
  onChange,
  onRemove,
  onDuplicate,
  isOverlay,
}: RepeaterEditorCardProps) {
  const { setSelectedBlockId } = useEditorContext();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });
  const [collectionName, setCollectionName] = useState<string | null>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const data = block.data;
  const cardTemplate = data.cardTemplate ?? [];

  useEffect(() => {
    if (!data.collectionId) { setCollectionName(null); return; }
    fetch(`/api/collections/${data.collectionId}`)
      .then((r) => r.json())
      .then((col) => setCollectionName(col.name ?? null))
      .catch(() => setCollectionName(null));
  }, [data.collectionId]);

  // Updates to direct card template children (called by ContainerEditorCard or SortableCardChild)
  const updateCardChild = (childId: string, updates: Partial<BlockData>) => {
    onChange(block.id, {
      cardTemplate: cardTemplate.map((c) =>
        c.id === childId ? { ...c, data: { ...c.data, ...updates } } : c
      ),
    } as Partial<BlockData>);
  };

  const removeCardChild = (childId: string) => {
    onChange(block.id, {
      cardTemplate: cardTemplate
        .filter((c) => c.id !== childId)
        .map((c, i) => ({ ...c, order: i })),
    } as Partial<BlockData>);
    setSelectedBlockId(null);
  };

  const duplicateCardChild = (childId: string) => {
    const idx = cardTemplate.findIndex((c) => c.id === childId);
    if (idx === -1) return;
    const copy: Block = { ...cardTemplate[idx], id: uuidv4(), order: idx + 1 };
    const newTemplate = [
      ...cardTemplate.slice(0, idx + 1),
      copy,
      ...cardTemplate.slice(idx + 1),
    ].map((c, i) => ({ ...c, order: i }));
    onChange(block.id, { cardTemplate: newTemplate } as Partial<BlockData>);
    setSelectedBlockId(copy.id);
  };

  const addCardBlock = (type: string) => {
    const newBlock =
      type === 'container'
        ? createContainerBlock(cardTemplate.length)
        : createBlock(type as BlockType, cardTemplate.length);
    onChange(block.id, { cardTemplate: [...cardTemplate, newBlock] } as Partial<BlockData>);
    setSelectedBlockId(newBlock.id);
  };

  const badgeText = [
    collectionName ?? 'No collection',
    `${data.columns ?? '3'} col`,
    `${cardTemplate.length} block${cardTemplate.length !== 1 ? 's' : ''}`,
  ].join(' · ');

  if (isOverlay) {
    return (
      <Card className="shadow-xl bg-background rotate-2 cursor-grabbing opacity-90">
        <CardHeader className="p-3 flex flex-row items-center gap-2 space-y-0 bg-muted/30 rounded-t-lg">
          <Repeat2 className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Repeater</span>
          <Badge variant="outline" className="text-xs">{badgeText}</Badge>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card ref={setNodeRef} style={style} className="group relative">
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
          <Repeat2 className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Repeater</span>
          <Badge
            variant="outline"
            className="text-xs font-mono text-muted-foreground hidden group-hover:inline-flex"
          >
            {badgeText}
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
        {!data.collectionId && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-3">
            No collection selected — choose one in the inspector panel.
          </p>
        )}

        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
          Card template (single preview)
        </p>

        <SortableContext items={cardTemplate.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="min-h-[64px] rounded-md border-2 border-dashed border-indigo-200 dark:border-indigo-800 p-2 flex flex-col gap-2">
            {cardTemplate.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground py-4">
                Empty — use "Add to card" below to design the card layout.
              </div>
            ) : (
              cardTemplate.map((child) =>
                child.type === 'container' ? (
                  <ContainerEditorCard
                    key={child.id}
                    block={child as { id: string; type: string; data: any; order: number }}
                    onChange={updateCardChild}
                    onRemove={removeCardChild}
                    onDuplicate={duplicateCardChild}
                  />
                ) : (
                  <SortableCardChild
                    key={child.id}
                    child={child}
                    onUpdate={updateCardChild}
                    onRemove={removeCardChild}
                    onDuplicate={duplicateCardChild}
                  />
                )
              )
            )}
          </div>
        </SortableContext>

        <AddCardBlockButton onAdd={addCardBlock} />
      </CardContent>
    </Card>
  );
}

// ── RepeaterPreview (used by renderPreview.tsx) ───────────────────────────────

export function RepeaterPreview({ block }: { block: RepeaterBlockData }) {
  const [entries, setEntries] = useState<Array<{ id: string; slug: string | null; data: unknown }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!block.collectionId) return;
    setLoading(true);
    fetch(`/api/entries?collectionId=${block.collectionId}`)
      .then((r) => r.json())
      .then((data) => setEntries(Array.isArray(data) ? data : []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [block.collectionId]);

  if (!block.collectionId) {
    return (
      <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', textAlign: 'center', padding: '32px 0' }}>
        Repeater: no collection selected.
      </p>
    );
  }

  if (loading || entries.length === 0) return null;

  const columns = COL_MAP[block.columns ?? '3'] ?? 3;
  const gap = GAP_MAP[block.repeaterGap ?? 'md'];
  const cardTemplate = block.cardTemplate ?? [];

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap,
  };

  return (
    <div style={gridStyle}>
      {entries.map((entry) => {
        const entryData = (entry.data as Record<string, any>) ?? {};
        return (
          <RepeaterEntryContext.Provider
            key={entry.id}
            value={{ entryData, collectionSlug: block.collectionSlug ?? null }}
          >
            <div>
              {cardTemplate.map((child) => {
                if (child.type === 'container') {
                  return <ContainerPreview key={child.id} block={child.data as ContainerBlockData} />;
                }
                const reg = BLOCKS_REGISTRY[child.type];
                if (!reg) return null;
                return <reg.Preview key={child.id} block={child.data as any} />;
              })}
            </div>
          </RepeaterEntryContext.Provider>
        );
      })}
    </div>
  );
}
