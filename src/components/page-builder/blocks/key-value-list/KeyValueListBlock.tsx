'use client';

import React from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { v4 as uuidv4 } from 'uuid';
import { type KeyValueListBlockData } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GripVertical, Plus, Trash2 } from 'lucide-react';

type Block = KeyValueListBlockData;
type Row = Block['items'][number];

// ── Editor row (inline sortable) ──────────────────────────────────────────

function SortableRow({
  row,
  onChange,
  onRemove,
}: {
  row: Row;
  onChange: (updates: Partial<Row>) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-[24px_1fr_1fr_28px] items-center gap-2"
    >
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing p-1"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <Input
        value={row.label}
        onChange={(e) => onChange({ label: e.target.value })}
        placeholder="Label"
        className="h-8 text-xs"
      />
      <Input
        value={row.value}
        onChange={(e) => onChange({ value: e.target.value })}
        placeholder="Value"
        className="h-8 text-xs"
      />
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
        aria-label="Remove row"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

// ── Editor ────────────────────────────────────────────────────────────────

export function KeyValueListEditor({
  block,
  onChange,
}: {
  block: Block;
  onChange: (updates: Partial<Block>) => void;
}) {
  const items = block.items ?? [];
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const updateRow = (id: string, updates: Partial<Row>) => {
    onChange({ items: items.map((r) => (r.id === id ? { ...r, ...updates } : r)) });
  };

  const addRow = () => {
    onChange({ items: [...items, { id: uuidv4(), label: '', value: '' }] });
  };

  const removeRow = (id: string) => {
    onChange({ items: items.filter((r) => r.id !== id) });
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex((r) => r.id === active.id);
    const newIdx = items.findIndex((r) => r.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    onChange({ items: arrayMove(items, oldIdx, newIdx) });
  };

  return (
    <div className="p-4 border rounded-md space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs">Heading</Label>
        <Input
          value={block.heading ?? ''}
          onChange={(e) => onChange({ heading: e.target.value })}
          placeholder="Optional list title"
          className="h-8 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Rows</Label>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((r) => r.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No rows yet. Add one below.</p>
              ) : (
                items.map((row) => (
                  <SortableRow
                    key={row.id}
                    row={row}
                    onChange={(u) => updateRow(row.id, u)}
                    onRemove={() => removeRow(row.id)}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs w-full mt-2"
          onClick={addRow}
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Row
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 border-t">
        <div className="flex items-center justify-between border rounded px-3 py-2">
          <Label className="text-xs">Striped</Label>
          <Switch
            checked={block.striped ?? true}
            onCheckedChange={(v) => onChange({ striped: v })}
          />
        </div>
        <div className="flex items-center justify-between border rounded px-3 py-2">
          <Label className="text-xs">Dividers</Label>
          <Switch
            checked={block.showDividers ?? true}
            onCheckedChange={(v) => onChange({ showDividers: v })}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Layout</Label>
        <Select
          value={block.layout ?? 'two-col'}
          onValueChange={(v) => onChange({ layout: v as Block['layout'] })}
        >
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="two-col">Two column (label · value)</SelectItem>
            <SelectItem value="stacked">Stacked (label above value)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// ── Preview ───────────────────────────────────────────────────────────────

export function KeyValueListPreview({ block }: { block: Block }) {
  const items = block.items ?? [];
  const striped = block.striped ?? true;
  const showDividers = block.showDividers ?? true;
  const layout = block.layout ?? 'two-col';

  if (items.length === 0 && !block.heading) return null;

  const scopeId = `kv-${(block.heading ?? 'list').replace(/[^a-z0-9]/gi, '')}`;

  const headingStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#0f172a',
    margin: '0 0 1rem 0',
  };

  const rowBase: React.CSSProperties = {
    padding: '0.75rem 1rem',
    fontSize: '0.9375rem',
  };

  const labelStyle: React.CSSProperties = {
    fontWeight: 600,
    color: '#334155',
  };

  const valueStyle: React.CSSProperties = {
    color: '#475569',
  };

  const responsiveCss = `
    [data-kv-list="${scopeId}"] .kv-row {
      display: ${layout === 'stacked' ? 'block' : 'grid'};
      ${layout === 'two-col' ? 'grid-template-columns: 3fr 2fr; gap: 1rem; align-items: baseline;' : ''}
    }
    [data-kv-list="${scopeId}"] .kv-value {
      text-align: ${layout === 'two-col' ? 'right' : 'left'};
      margin-top: ${layout === 'stacked' ? '0.25rem' : '0'};
    }
    @media (max-width: 767.98px) {
      [data-kv-list="${scopeId}"] .kv-row {
        display: block !important;
      }
      [data-kv-list="${scopeId}"] .kv-value {
        text-align: left !important;
        margin-top: 0.25rem !important;
      }
    }
    @container preview (max-width: 767.98px) {
      [data-kv-list="${scopeId}"] .kv-row {
        display: block !important;
      }
      [data-kv-list="${scopeId}"] .kv-value {
        text-align: left !important;
        margin-top: 0.25rem !important;
      }
    }
  `;

  return (
    <div data-kv-list={scopeId}>
      <style dangerouslySetInnerHTML={{ __html: responsiveCss }} />
      {block.heading && <h3 style={headingStyle}>{block.heading}</h3>}
      <dl
        style={{
          margin: 0,
          border: showDividers ? '1px solid #e2e8f0' : 'none',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        {items.map((row, idx) => (
          <div
            key={row.id}
            className="kv-row"
            style={{
              ...rowBase,
              backgroundColor: striped && idx % 2 === 1 ? '#f8fafc' : '#ffffff',
              borderBottom:
                showDividers && idx < items.length - 1 ? '1px solid #e2e8f0' : 'none',
            }}
          >
            <dt style={labelStyle}>{row.label || '—'}</dt>
            <dd className="kv-value" style={{ ...valueStyle, margin: 0 }}>
              {row.value || '—'}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
