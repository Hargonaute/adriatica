'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { type BlockData, type TableColumnConfig } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCollectionItem } from '@/contexts/CollectionItemContext';
import { useRepeaterEntry } from '@/contexts/RepeaterEntryContext';
import { useMockCollectionEntry } from '@/contexts/MockCollectionEntryContext';

type TableBlock = BlockData & { type: 'table' };

const DEFAULT_HEADERS = ['Column 1', 'Column 2', 'Column 3'];
const DEFAULT_ROWS: string[][] = [
  ['', '', ''],
  ['', '', ''],
];

function normaliseRows(rows: string[][], colCount: number): string[][] {
  return rows.map((r) => {
    if (r.length === colCount) return r;
    if (r.length > colCount) return r.slice(0, colCount);
    return [...r, ...Array(colCount - r.length).fill('')];
  });
}

function normaliseConfigs(configs: TableColumnConfig[] | undefined, colCount: number): TableColumnConfig[] {
  const base = configs ?? [];
  if (base.length === colCount) return base;
  if (base.length > colCount) return base.slice(0, colCount);
  return [...base, ...Array(colCount - base.length).fill({})];
}

// Same resolution logic as ProductHeroBlock — bound value wins over literal.
function useBoundValue(
  fieldKey: string | null | undefined,
  literal: string | undefined,
): string | undefined {
  const repeaterCtx = useRepeaterEntry();
  const mockCtx = useMockCollectionEntry();
  const collectionCtx = useCollectionItem();

  if (fieldKey) {
    if (repeaterCtx) {
      const v = repeaterCtx.entryData[fieldKey];
      if (v != null) return String(v);
    }
    if (mockCtx) {
      const v = mockCtx.entryData[fieldKey];
      if (v != null) return String(v);
    }
    if (collectionCtx?.entry) {
      const v = collectionCtx.entry.data[fieldKey];
      if (v != null) return String(v);
    }
  }

  return literal;
}

// ── Rich-text cell editor ─────────────────────────────────────────────────

function RichCellEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit.configure({ link: false })],
    content: value,
    editorProps: {
      attributes: { class: 'p-1.5 min-h-[56px] focus:outline-none text-xs prose prose-xs max-w-none' },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  return (
    <div className="border rounded bg-background">
      <EditorContent editor={editor} />
    </div>
  );
}

// ── Editor ────────────────────────────────────────────────────────────────

export function TableEditor({
  block,
  onChange,
}: {
  block: TableBlock;
  onChange: (updates: Partial<BlockData>) => void;
}) {
  const headers: string[] = block.headers ?? DEFAULT_HEADERS;
  const rows: string[][] = normaliseRows(block.rows ?? DEFAULT_ROWS, headers.length);
  const configs: TableColumnConfig[] = normaliseConfigs((block as any).columnConfigs, headers.length);
  const striped = block.striped ?? true;
  const bordered = block.bordered ?? true;

  const updateHeader = (i: number, value: string) => {
    const next = headers.map((h: string, idx: number) => (idx === i ? value : h));
    onChange({ headers: next });
  };

  const updateCell = (rowIdx: number, colIdx: number, value: string) => {
    const next = rows.map((r, ri) =>
      ri === rowIdx ? r.map((c, ci) => (ci === colIdx ? value : c)) : r
    );
    onChange({ rows: next });
  };

  const updateColType = (colIdx: number, type: 'text' | 'rich-text') => {
    const next = configs.map((c, i) => (i === colIdx ? { ...c, type } : c));
    onChange({ columnConfigs: next } as Partial<BlockData>);
  };

  const addRow = () => {
    onChange({ rows: [...rows, Array(headers.length).fill('')] });
  };

  const removeLastRow = () => {
    if (rows.length <= 1) return;
    onChange({ rows: rows.slice(0, -1) });
  };

  const addColumn = () => {
    onChange({
      headers: [...headers, `Column ${headers.length + 1}`],
      rows: rows.map((r) => [...r, '']),
      columnConfigs: [...configs, {}],
    } as Partial<BlockData>);
  };

  const removeLastColumn = () => {
    if (headers.length <= 1) return;
    onChange({
      headers: headers.slice(0, -1),
      rows: rows.map((r) => r.slice(0, -1)),
      columnConfigs: configs.slice(0, -1),
    } as Partial<BlockData>);
  };

  return (
    <div className="p-4 border rounded-md space-y-4">
      {/* Caption */}
      <div className="space-y-1.5">
        <Label className="text-xs">Caption</Label>
        <Input
          value={block.caption ?? ''}
          onChange={(e) => onChange({ caption: e.target.value })}
          placeholder="Optional table title"
          className="h-8 text-sm"
        />
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center justify-between border rounded px-3 py-2">
          <Label className="text-xs">Striped</Label>
          <Switch checked={striped} onCheckedChange={(v) => onChange({ striped: v })} />
        </div>
        <div className="flex items-center justify-between border rounded px-3 py-2">
          <Label className="text-xs">Bordered</Label>
          <Switch checked={bordered} onCheckedChange={(v) => onChange({ bordered: v })} />
        </div>
      </div>

      {/* Grid */}
      <div className="space-y-1.5">
        <Label className="text-xs">Cells</Label>
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-xs">
            <thead className="bg-muted">
              <tr>
                {headers.map((h: string, i: number) => {
                  const colType = configs[i]?.type ?? 'text';
                  return (
                    <th key={i} className="p-1.5 border-r last:border-r-0 border-border align-top">
                      <Input
                        value={h}
                        onChange={(e) => updateHeader(i, e.target.value)}
                        placeholder={`Header ${i + 1}`}
                        className="h-7 text-xs font-semibold mb-1.5"
                      />
                      {/* Per-column type toggle */}
                      <div className="flex gap-1 justify-center">
                        <button
                          type="button"
                          onClick={() => updateColType(i, 'text')}
                          className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded border transition-colors',
                            colType === 'text'
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'border-border hover:bg-muted text-muted-foreground'
                          )}
                        >
                          Text
                        </button>
                        <button
                          type="button"
                          onClick={() => updateColType(i, 'rich-text')}
                          className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded border transition-colors',
                            colType === 'rich-text'
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'border-border hover:bg-muted text-muted-foreground'
                          )}
                        >
                          Rich
                        </button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row: string[], ri: number) => (
                <tr key={ri} className="border-t border-border">
                  {row.map((cell: string, ci: number) => {
                    const colType = configs[ci]?.type ?? 'text';
                    return (
                      <td key={ci} className="p-1.5 border-r last:border-r-0 border-border align-top">
                        {colType === 'rich-text' ? (
                          <RichCellEditor
                            value={cell}
                            onChange={(html) => updateCell(ri, ci, html)}
                          />
                        ) : (
                          <Input
                            value={cell}
                            onChange={(e) => updateCell(ri, ci, e.target.value)}
                            placeholder="—"
                            className="h-7 text-xs"
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Toggle Text / Rich per column. Field bindings are configured in the Inspector (template mode).
        </p>
      </div>

      {/* Row + column controls */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs flex-1" onClick={addRow}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Row
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs flex-1"
            onClick={removeLastRow}
            disabled={rows.length <= 1}
          >
            <Minus className="h-3.5 w-3.5 mr-1" /> Row
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs flex-1" onClick={addColumn}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Col
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs flex-1"
            onClick={removeLastColumn}
            disabled={headers.length <= 1}
          >
            <Minus className="h-3.5 w-3.5 mr-1" /> Col
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Preview ───────────────────────────────────────────────────────────────

// Separate component so each cell can call useBoundValue independently.
function BoundCell({
  fieldKey,
  literal,
  isRichText,
  className,
}: {
  fieldKey: string | null | undefined;
  literal: string;
  isRichText: boolean;
  className?: string;
}) {
  const resolved = useBoundValue(fieldKey, literal);
  const content = resolved ?? '';
  return (
    <td className={className}>
      {isRichText || content.startsWith('<') ? (
        <span dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        content || '—'
      )}
    </td>
  );
}

export function TablePreview({ block, className }: { block: TableBlock; className?: string }) {
  const headers: string[] = block.headers ?? DEFAULT_HEADERS;
  const rows: string[][] = normaliseRows(block.rows ?? DEFAULT_ROWS, headers.length);
  const configs: TableColumnConfig[] = normaliseConfigs((block as any).columnConfigs, headers.length);
  const striped = block.striped ?? true;
  const bordered = block.bordered ?? true;

  if (headers.length === 0) {
    return (
      <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground text-sm">
        No columns yet. Add columns in the editor.
      </div>
    );
  }

  const cellBase = 'px-4 py-3 text-left align-top text-sm';
  const cellBorder = bordered ? 'border border-slate-200' : '';

  return (
    <div className={cn('w-full', className)}>
      {block.caption && (
        <h3 className="text-lg font-semibold text-foreground mb-3">{block.caption}</h3>
      )}
      <div className="w-full overflow-x-auto">
        <table
          className={cn(
            'w-full border-collapse text-foreground',
            bordered && 'border border-slate-200'
          )}
        >
          <thead>
            <tr className="bg-slate-50">
              {headers.map((h: string, i: number) => (
                <th
                  key={i}
                  scope="col"
                  className={cn(cellBase, cellBorder, 'font-semibold text-slate-900')}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row: string[], ri: number) => (
              <tr
                key={ri}
                className={cn(striped && ri % 2 === 1 && 'bg-slate-50/60')}
              >
                {row.map((cell: string, ci: number) => {
                  const config = configs[ci];
                  return (
                    <BoundCell
                      key={ci}
                      fieldKey={config?.fieldKey}
                      literal={cell}
                      isRichText={config?.type === 'rich-text'}
                      className={cn(cellBase, cellBorder, 'text-slate-700')}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
