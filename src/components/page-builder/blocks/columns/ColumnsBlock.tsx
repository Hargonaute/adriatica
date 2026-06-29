'use client';

import { type BlockData } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';

interface ColumnItem {
  id: string;
  icon?: string;
  title: string;
  body?: string;
}

const colsMap: Record<number, string> = {
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
};

const gapMap: Record<string, string> = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-10',
};

// ── Editor ────────────────────────────────────────────────────────────────

export function ColumnsEditor({
  block,
  onChange,
}: {
  block: BlockData & { type: 'columns' };
  onChange: (updates: Partial<BlockData>) => void;
}) {
  const items: ColumnItem[] = block.items ?? [];

  const updateItem = (index: number, updates: Partial<ColumnItem>) => {
    const next = items.map((item, i) => (i === index ? { ...item, ...updates } : item));
    onChange({ items: next });
  };

  const addItem = () => {
    onChange({ items: [...items, { id: uuidv4(), icon: '✨', title: 'Feature', body: 'Describe this feature.' }] });
  };

  const removeItem = (index: number) => {
    onChange({ items: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4 p-4 border rounded-md">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Columns</Label>
          <Select
            value={String(block.columns ?? 3)}
            onValueChange={(v) => onChange({ columns: Number(v) as any })}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 Columns</SelectItem>
              <SelectItem value="3">3 Columns</SelectItem>
              <SelectItem value="4">4 Columns</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Gap</Label>
          <Select
            value={block.gap ?? 'md'}
            onValueChange={(v) => onChange({ gap: v as any })}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-xs">Items</Label>
        {items.map((item, i) => (
          <div key={item.id} className="border rounded-md p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Input
                value={item.icon ?? ''}
                onChange={(e) => updateItem(i, { icon: e.target.value })}
                placeholder="✨"
                className="w-16 h-8 text-center text-lg"
              />
              <Input
                value={item.title}
                onChange={(e) => updateItem(i, { title: e.target.value })}
                placeholder="Feature title"
                className="h-8 flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeItem(i)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Input
              value={item.body ?? ''}
              onChange={(e) => updateItem(i, { body: e.target.value })}
              placeholder="Short description of this feature..."
              className="h-8 text-sm"
            />
          </div>
        ))}
        <Button variant="outline" size="sm" className="w-full h-8 text-xs" onClick={addItem}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Item
        </Button>
      </div>
    </div>
  );
}

// ── Preview ───────────────────────────────────────────────────────────────

export function ColumnsPreview({ block }: { block: BlockData & { type: 'columns' } }) {
  const items: ColumnItem[] = block.items ?? [];
  const cols = colsMap[block.columns ?? 3] ?? colsMap[3];
  const gap = gapMap[block.gap ?? 'md'];

  if (items.length === 0) {
    return (
      <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground text-sm">
        No items yet. Add items in the editor.
      </div>
    );
  }

  return (
    <div className={cn('grid', cols, gap)}>
      {items.map((item) => (
        <div key={item.id} className="space-y-3">
          {item.icon && (
            <div className="text-3xl">{item.icon}</div>
          )}
          <h3 className="text-2xl font-semibold text-foreground">{item.title}</h3>
          {item.body && (
            <p className="text-base text-muted-foreground leading-relaxed">{item.body}</p>
          )}
        </div>
      ))}
    </div>
  );
}
