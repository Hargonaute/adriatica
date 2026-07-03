'use client';

import { type BlockData, type FormBlockData } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2, GripVertical } from 'lucide-react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Collection {
    id: string;
    name: string;
}

interface CollectionFieldMeta {
  key: string;
  label: string;
  type?: string;
  required?: boolean;
}

type FieldConfigEntry = NonNullable<FormBlockData['fieldConfig']>[number];

// Merge the collection's real fields with the stored fieldConfig. Any fields
// missing from the config get appended (included by default); stale entries
// pointing at removed fields are dropped.
function reconcileFieldConfig(
  fields: CollectionFieldMeta[],
  config: FieldConfigEntry[] | undefined,
): FieldConfigEntry[] {
  const validKeys = new Set(fields.map((f) => f.key));
  const seen = new Set<string>();
  const ordered: FieldConfigEntry[] = [];
  for (const entry of config ?? []) {
    if (!validKeys.has(entry.key) || seen.has(entry.key)) continue;
    ordered.push(entry);
    seen.add(entry.key);
  }
  for (const f of fields) {
    if (seen.has(f.key)) continue;
    ordered.push({ key: f.key, included: true });
  }
  return ordered;
}

// --- Sortable row for the field config list ---
function SortableFieldRow({
  entry,
  originalLabel,
  onToggle,
  onLabelChange,
}: {
  entry: FieldConfigEntry;
  originalLabel: string;
  onToggle: (included: boolean) => void;
  onLabelChange: (label: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: entry.key,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded border bg-background px-2 py-1.5"
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        title="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <Checkbox
        checked={entry.included}
        onCheckedChange={(v) => onToggle(v === true)}
        id={`fc-${entry.key}`}
      />
      <label htmlFor={`fc-${entry.key}`} className="text-xs font-medium min-w-[80px] shrink-0 truncate">
        {originalLabel}
      </label>
      <Input
        value={entry.label ?? ''}
        onChange={(e) => onLabelChange(e.target.value)}
        placeholder={originalLabel}
        className="h-7 text-xs flex-1"
      />
    </div>
  );
}

// --- Editor Component ---
export function FormEditor({
  block,
  onChange,
}: {
  block: BlockData & { type: 'form' };
  onChange: (updates: Partial<BlockData>) => void;
}) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [fields, setFields] = useState<CollectionFieldMeta[]>([]);

  useEffect(() => {
    fetch('/api/collections')
      .then(res => res.json())
      .then(data => {
          if (Array.isArray(data)) setCollections(data);
      });
  }, []);

  useEffect(() => {
    if (!block.collectionId) { setFields([]); return; }
    const controller = new AbortController();
    fetch(`/api/collections/${block.collectionId}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.fields)) setFields(data.fields);
        else setFields([]);
      })
      .catch((err) => { if (err?.name !== 'AbortError') setFields([]); });
    return () => controller.abort();
  }, [block.collectionId]);

  const fieldConfig = useMemo(
    () => reconcileFieldConfig(fields, block.fieldConfig),
    [fields, block.fieldConfig],
  );

  const originalLabelByKey = useMemo(() => {
    const m: Record<string, string> = {};
    for (const f of fields) m[f.key] = f.label;
    return m;
  }, [fields]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const commit = (next: FieldConfigEntry[]) => {
    onChange({ fieldConfig: next } as Partial<BlockData>);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = fieldConfig.findIndex((f) => f.key === active.id);
    const newIdx = fieldConfig.findIndex((f) => f.key === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    commit(arrayMove(fieldConfig, oldIdx, newIdx));
  };

  return (
    <div className="space-y-4 p-4 border rounded-md bg-background">
       <div className="space-y-2">
           <Label>Select Collection</Label>
           <Select
             value={block.collectionId}
             onValueChange={(val) => onChange({ collectionId: val })}
           >
             <SelectTrigger>
               <SelectValue placeholder="Choose a collection..." />
             </SelectTrigger>
             <SelectContent>
                {collections.map(col => (
                    <SelectItem key={col.id} value={col.id}>{col.name}</SelectItem>
                ))}
             </SelectContent>
           </Select>
           <p className="text-xs text-muted-foreground">
              Submissions will be saved to this collection.
           </p>
       </div>

       {block.collectionId && fields.length > 0 && (
         <div className="space-y-2">
           <Label>Fields</Label>
           <p className="text-xs text-muted-foreground">
             Toggle inclusion, drag to reorder, override labels.
           </p>
           <DndContext
             sensors={sensors}
             collisionDetection={closestCenter}
             onDragEnd={handleDragEnd}
           >
             <SortableContext items={fieldConfig.map((f) => f.key)} strategy={verticalListSortingStrategy}>
               <div className="space-y-1">
                 {fieldConfig.map((entry) => (
                   <SortableFieldRow
                     key={entry.key}
                     entry={entry}
                     originalLabel={originalLabelByKey[entry.key] ?? entry.key}
                     onToggle={(included) =>
                       commit(
                         fieldConfig.map((e) =>
                           e.key === entry.key ? { ...e, included } : e
                         )
                       )
                     }
                     onLabelChange={(label) =>
                       commit(
                         fieldConfig.map((e) =>
                           e.key === entry.key
                             ? { ...e, label: label === '' ? undefined : label }
                             : e
                         )
                       )
                     }
                   />
                 ))}
               </div>
             </SortableContext>
           </DndContext>
         </div>
       )}

       <div className="space-y-2">
           <Label>Submit Button Label</Label>
           <Input
             value={block.submitLabel || 'Submit'}
             onChange={(e) => onChange({ submitLabel: e.target.value })}
           />
       </div>

       <div className="space-y-2">
           <Label>Success Message</Label>
           <Input
             value={block.successMessage || "Thank you! We'll be in touch."}
             onChange={(e) => onChange({ successMessage: e.target.value })}
           />
       </div>
    </div>
  );
}

// --- Preview / Public Component ---
export function FormPreview({
  block,
  className
}: {
  block: BlockData & { type: 'form' };
  className?: string;
}) {
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
      if (!block.collectionId) return;
      setLoading(true);
      fetch(`/api/collections/${block.collectionId}`)
          .then(res => res.json())
          .then(data => {
              if (data.fields) setFields(data.fields);
              setLoading(false);
          })
          .catch(() => setLoading(false));
  }, [block.collectionId]);

  // Order/filter fields according to fieldConfig; fields absent from the
  // config keep their natural order at the end and default to included.
  const orderedFields = useMemo<Array<{ field: any; overrideLabel?: string }>>(() => {
    if (!fields.length) return [];
    const config = block.fieldConfig ?? [];
    if (!config.length) return fields.map((f) => ({ field: f }));
    const byKey = new Map<string, any>(fields.map((f) => [f.key, f]));
    const seen = new Set<string>();
    const result: Array<{ field: any; overrideLabel?: string }> = [];
    for (const c of config) {
      const f = byKey.get(c.key);
      seen.add(c.key);
      if (!f || !c.included) continue;
      result.push({ field: f, overrideLabel: c.label });
    }
    for (const f of fields) {
      if (seen.has(f.key)) continue;
      result.push({ field: f });
    }
    return result;
  }, [fields, block.fieldConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      try {
          const res = await fetch('/api/entries/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  collectionId: block.collectionId,
                  data: formData
              }),
          });

          if (!res.ok) throw new Error('Submission failed');

          setSuccess(true);
          setFormData({});
          toast.success('Form submitted successfully');
      } catch (error) {
          toast.error('Failed to submit form');
      } finally {
          setSubmitting(false);
      }
  };

  if (!block.collectionId) {
      return <div className="p-4 border border-dashed rounded text-center text-muted-foreground">Select a collection to display form.</div>;
  }

  if (loading) return <div className="p-4 text-center"><Loader2 className="animate-spin h-6 w-6 mx-auto" /></div>;

  if (success) {
      return (
          <div className="p-8 text-center bg-green-50 text-green-800 rounded-lg border border-green-200">
              <h3 className="text-lg font-bold mb-2">Success!</h3>
              <p>{block.successMessage || 'Thank you!'}</p>
              <Button variant="link" onClick={() => setSuccess(false)} className="mt-4">Submit another</Button>
          </div>
      );
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
        <div className="space-y-4">
            {orderedFields.map(({ field, overrideLabel }) => {
                const displayLabel = overrideLabel && overrideLabel.trim() !== '' ? overrideLabel : field.label;
                return (
                    <div key={field.id ?? field.key} className="space-y-2">
                        <Label>
                            {displayLabel} {field.required && <span className="text-destructive">*</span>}
                        </Label>

                        {field.type === 'textarea' ? (
                            <Textarea
                                required={field.required}
                                value={formData[field.key] || ''}
                                onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                            />
                        ) : field.type === 'checkbox' ? (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id={field.key}
                                    checked={formData[field.key] || false}
                                    onCheckedChange={(checked: boolean | string) => setFormData({...formData, [field.key]: checked})}
                                />
                                <label htmlFor={field.key} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Yes
                                </label>
                            </div>
                        ) : (
                            <Input
                                type={field.type}
                                required={field.required}
                                value={formData[field.key] || ''}
                                onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                            />
                        )}
                    </div>
                );
            })}

            <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {block.submitLabel || 'Submit'}
            </Button>
        </div>
    </form>
  );
}
