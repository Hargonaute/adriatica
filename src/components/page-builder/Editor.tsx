'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { v4 as uuidv4 } from 'uuid';
import { type PageData, type Block, type BlockData, type ContainerBlockData, type RepeaterBlockData } from '@/types';
import { createBlock } from './blocks/createBlock';
import { ContainerEditorCard, createContainerBlock } from './blocks/container/ContainerBlock';
import { RepeaterEditorCard, createRepeaterBlock } from './blocks/repeater/RepeaterBlock';
import { EditorContext } from './EditorContext';
import { RenderEditor } from './renderEditor';
import { RenderPreview } from './renderPreview';
import { BlockSelector } from './BlockSelector';
import { Inspector } from './Inspector';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Code, Layout, Save, Globe, ExternalLink, ArrowLeft, Plus, Monitor, Tablet, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTemplateBuilderStore } from '@/lib/store/templateBuilderStore';
import { MockCollectionEntryContext } from '@/contexts/MockCollectionEntryContext';
import { buildMockEntryData } from '@/lib/mockEntryData';
import { Navbar } from '@/components/home/Navbar';
import { SiteFooter } from '@/components/home/SiteFooter';

interface PageBuilderEditorProps {
  initialData: PageData;
  mode?: 'static' | 'template';
  /** Kind of template being edited. Only meaningful when mode === 'template'. */
  templateKind?: 'index' | 'detail' | null;
  onSave?: (data: PageData) => Promise<void>;
  onPublish?: (data: PageData) => Promise<void>;
  onUnpublish?: (data: PageData) => Promise<void>;
}

const AUTO_SAVE_DELAY = 30_000; // 30 seconds

// Recursive block lookup — searches top-level, container children, repeater card templates
function findBlock(blocks: Block[], id: string): Block | null {
  for (const b of blocks) {
    if (b.id === id) return b;
    if (b.type === 'container') {
      const found = findBlock((b.data as ContainerBlockData).children ?? [], id);
      if (found) return found;
    }
    if (b.type === 'repeater') {
      const found = findBlock((b.data as RepeaterBlockData).cardTemplate ?? [], id);
      if (found) return found;
    }
  }
  return null;
}

// Finds the nearest enclosing Repeater for `id`. Returns null if `id` is the
// repeater itself or lives at the top level / inside a container outside any
// repeater. Used by the Inspector so blocks inside a Repeater's cardTemplate
// pick up template-mode UI (field binding) bound to the Repeater's collection.
function findParentRepeater(blocks: Block[], id: string): RepeaterBlockData | null {
  for (const b of blocks) {
    if (b.type === 'repeater') {
      const rd = b.data as RepeaterBlockData;
      if (findBlock(rd.cardTemplate ?? [], id)) return rd;
    }
    if (b.type === 'container') {
      const found = findParentRepeater((b.data as ContainerBlockData).children ?? [], id);
      if (found) return found;
    }
  }
  return null;
}

export default function PageBuilderEditor({ initialData, mode = 'static', templateKind = null, onSave, onPublish, onUnpublish }: PageBuilderEditorProps) {
  const [data, setData] = useState<PageData>(initialData);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'json'>('edit');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Reset viewport when leaving Preview mode
  useEffect(() => {
    if (activeTab !== 'preview') setViewport('desktop');
  }, [activeTab]);

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestData = useRef(data);
  latestData.current = data;

  const blocks = data.blocks[language] || [];

  // ── Sensors ──────────────────────────────────────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ── Mark dirty on every data change ─────────────────────────────────────

  const markDirty = () => setIsDirty(true);

  // ── Auto-save ────────────────────────────────────────────────────────────

  const triggerSave = useCallback(async (silent = false) => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave(latestData.current);
      setIsDirty(false);
      if (!silent) toast.success('Draft saved');
    } catch {
      if (!silent) toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  }, [onSave]);

  // Reset auto-save timer whenever data changes
  useEffect(() => {
    if (!isDirty) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => triggerSave(true), AUTO_SAVE_DELAY);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [data, isDirty, triggerSave]);

  // ── Keyboard shortcut Cmd/Ctrl+S ─────────────────────────────────────────

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        triggerSave(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerSave]);

  // ── Unsaved changes warning on page leave ────────────────────────────────

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // ── Block mutations ───────────────────────────────────────────────────────

  const setBlocks = (next: Block[]) => {
    setData((prev) => ({ ...prev, blocks: { ...prev.blocks, [language]: next } }));
    markDirty();
  };

  const handleDragStart = (event: any) => setActiveDragId(event.active.id);

  const handleDragEnd = (event: any) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Top-level sort
    const oldTopIdx = blocks.findIndex((b) => b.id === active.id);
    if (oldTopIdx !== -1) {
      const newTopIdx = blocks.findIndex((b) => b.id === over.id);
      if (newTopIdx !== -1) {
        setBlocks(arrayMove(blocks, oldTopIdx, newTopIdx).map((b, i) => ({ ...b, order: i })));
      }
      return;
    }

    // Child sort within a top-level container
    let moved = false;
    const newBlocks = blocks.map((b) => {
      if (b.type !== 'container') return b;
      const containerData = b.data as ContainerBlockData;
      const children = containerData.children ?? [];
      const oldChildIdx = children.findIndex((c) => c.id === active.id);
      if (oldChildIdx === -1) return b;
      const newChildIdx = children.findIndex((c) => c.id === over.id);
      if (newChildIdx === -1) return b;
      moved = true;
      const newChildren = arrayMove(children, oldChildIdx, newChildIdx).map((c, i) => ({ ...c, order: i }));
      return { ...b, data: { ...b.data, children: newChildren } };
    });
    if (moved) { setBlocks(newBlocks); return; }

    // Card template sort within a repeater
    for (const b of blocks) {
      if (b.type !== 'repeater') continue;
      const rd = b.data as RepeaterBlockData;
      const template = rd.cardTemplate ?? [];

      // Direct card template reorder
      const oldTIdx = template.findIndex((c) => c.id === active.id);
      if (oldTIdx !== -1) {
        const newTIdx = template.findIndex((c) => c.id === over.id);
        if (newTIdx !== -1) {
          const newTemplate = arrayMove(template, oldTIdx, newTIdx).map((c, i) => ({ ...c, order: i }));
          setBlocks(blocks.map((bl) =>
            bl.id === b.id ? { ...bl, data: { ...bl.data, cardTemplate: newTemplate } } : bl
          ));
          return;
        }
      }

      // Container child reorder within a container inside the card template
      for (const t of template) {
        if (t.type !== 'container') continue;
        const children = (t.data as ContainerBlockData).children ?? [];
        const oldCIdx = children.findIndex((c) => c.id === active.id);
        if (oldCIdx === -1) continue;
        const newCIdx = children.findIndex((c) => c.id === over.id);
        if (newCIdx === -1) continue;
        const newChildren = arrayMove(children, oldCIdx, newCIdx).map((c, i) => ({ ...c, order: i }));
        setBlocks(blocks.map((bl) =>
          bl.id === b.id
            ? {
                ...bl,
                data: {
                  ...bl.data,
                  cardTemplate: template.map((tc) =>
                    tc.id === t.id
                      ? { ...tc, data: { ...tc.data, children: newChildren } }
                      : tc
                  ),
                },
              }
            : bl
        ));
        return;
      }
    }
  };

  const addBlock = (type: string) => {
    const newBlock =
      type === 'container' ? createContainerBlock(blocks.length) :
      type === 'repeater'  ? createRepeaterBlock(blocks.length) :
      createBlock(type as any, blocks.length);
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
    toast.success(`Added ${BLOCK_LABEL[type] ?? type} block`);
  };

  const updateBlock = (id: string, updates: Partial<BlockData>) => {
    setData((prevData) => {
      const prevBlocks = prevData.blocks[language] || [];
      const nextBlocks = prevBlocks.map((b) => {
        if (b.id === id) return { ...b, data: { ...b.data, ...updates } };

        // Container child
        if (b.type === 'container') {
          const containerData = b.data as ContainerBlockData;
          const children = containerData.children ?? [];
          if (children.some((c) => c.id === id)) {
            return {
              ...b,
              data: {
                ...b.data,
                children: children.map((c) =>
                  c.id === id ? { ...c, data: { ...c.data, ...updates } } : c
                ),
              },
            };
          }
        }

        // Repeater card template
        if (b.type === 'repeater') {
          const rd = b.data as RepeaterBlockData;
          const template = rd.cardTemplate ?? [];
          // Direct card template child
          if (template.some((c) => c.id === id)) {
            return {
              ...b,
              data: {
                ...b.data,
                cardTemplate: template.map((c) =>
                  c.id === id ? { ...c, data: { ...c.data, ...updates } } : c
                ),
              },
            };
          }
          // Container grandchild inside card template
          for (const t of template) {
            if (t.type !== 'container') continue;
            const children = (t.data as ContainerBlockData).children ?? [];
            if (children.some((c) => c.id === id)) {
              return {
                ...b,
                data: {
                  ...b.data,
                  cardTemplate: template.map((tc) =>
                    tc.id === t.id
                      ? {
                          ...tc,
                          data: {
                            ...tc.data,
                            children: children.map((c) =>
                              c.id === id ? { ...c, data: { ...c.data, ...updates } } : c
                            ),
                          },
                        }
                      : tc
                  ),
                },
              };
            }
          }
        }

        return b;
      });
      return { ...prevData, blocks: { ...prevData.blocks, [language]: nextBlocks } };
    });
    markDirty();
  };

  const removeBlock = (id: string) => {
    if (blocks.some((b) => b.id === id)) {
      setBlocks(blocks.filter((b) => b.id !== id).map((b, i) => ({ ...b, order: i })));
    } else {
      setBlocks(blocks.map((b) => {
        // Container child (existing)
        if (b.type === 'container') {
          const containerData = b.data as ContainerBlockData;
          const children = containerData.children ?? [];
          if (!children.some((c) => c.id === id)) return b;
          return {
            ...b,
            data: {
              ...b.data,
              children: children.filter((c) => c.id !== id).map((c, i) => ({ ...c, order: i })),
            },
          };
        }
        // Repeater card template
        if (b.type === 'repeater') {
          const rd = b.data as RepeaterBlockData;
          const template = rd.cardTemplate ?? [];
          if (template.some((c) => c.id === id)) {
            return {
              ...b,
              data: {
                ...b.data,
                cardTemplate: template.filter((c) => c.id !== id).map((c, i) => ({ ...c, order: i })),
              },
            };
          }
          for (const t of template) {
            if (t.type !== 'container') continue;
            const children = (t.data as ContainerBlockData).children ?? [];
            if (!children.some((c) => c.id === id)) continue;
            return {
              ...b,
              data: {
                ...b.data,
                cardTemplate: template.map((tc) =>
                  tc.id === t.id
                    ? {
                        ...tc,
                        data: {
                          ...tc.data,
                          children: children.filter((c) => c.id !== id).map((c, i) => ({ ...c, order: i })),
                        },
                      }
                    : tc
                ),
              },
            };
          }
        }
        return b;
      }));
    }
    if (selectedBlockId === id) setSelectedBlockId(null);
    toast.success('Block removed');
  };

  const duplicateBlock = (id: string) => {
    // Top-level duplicate
    const topIdx = blocks.findIndex((b) => b.id === id);
    if (topIdx !== -1) {
      const copy: Block = { ...blocks[topIdx], id: uuidv4(), order: topIdx + 1 };
      const next = [
        ...blocks.slice(0, topIdx + 1),
        copy,
        ...blocks.slice(topIdx + 1),
      ].map((b, i) => ({ ...b, order: i }));
      setBlocks(next);
      setSelectedBlockId(copy.id);
      toast.success('Block duplicated');
      return;
    }

    // Child of a top-level container
    for (const block of blocks) {
      if (block.type !== 'container') continue;
      const containerData = block.data as ContainerBlockData;
      const children = containerData.children ?? [];
      const childIdx = children.findIndex((c) => c.id === id);
      if (childIdx === -1) continue;
      const copy: Block = { ...children[childIdx], id: uuidv4(), order: childIdx + 1 };
      const newChildren = [
        ...children.slice(0, childIdx + 1),
        copy,
        ...children.slice(childIdx + 1),
      ].map((c, i) => ({ ...c, order: i }));
      setBlocks(blocks.map((b) =>
        b.id === block.id
          ? { ...b, data: { ...b.data, children: newChildren } }
          : b
      ));
      setSelectedBlockId(copy.id);
      toast.success('Block duplicated');
      return;
    }

    // Child in a repeater card template
    for (const block of blocks) {
      if (block.type !== 'repeater') continue;
      const rd = block.data as RepeaterBlockData;
      const template = rd.cardTemplate ?? [];

      // Direct card template child
      const tIdx = template.findIndex((c) => c.id === id);
      if (tIdx !== -1) {
        const copy: Block = { ...template[tIdx], id: uuidv4(), order: tIdx + 1 };
        const newTemplate = [
          ...template.slice(0, tIdx + 1),
          copy,
          ...template.slice(tIdx + 1),
        ].map((c, i) => ({ ...c, order: i }));
        setBlocks(blocks.map((b) =>
          b.id === block.id ? { ...b, data: { ...b.data, cardTemplate: newTemplate } } : b
        ));
        setSelectedBlockId(copy.id);
        toast.success('Block duplicated');
        return;
      }

      // Container grandchild in card template
      for (const t of template) {
        if (t.type !== 'container') continue;
        const children = (t.data as ContainerBlockData).children ?? [];
        const childIdx = children.findIndex((c) => c.id === id);
        if (childIdx === -1) continue;
        const copy: Block = { ...children[childIdx], id: uuidv4(), order: childIdx + 1 };
        const newChildren = [
          ...children.slice(0, childIdx + 1),
          copy,
          ...children.slice(childIdx + 1),
        ].map((c, i) => ({ ...c, order: i }));
        setBlocks(blocks.map((b) =>
          b.id === block.id
            ? {
                ...b,
                data: {
                  ...b.data,
                  cardTemplate: template.map((tc) =>
                    tc.id === t.id
                      ? { ...tc, data: { ...tc.data, children: newChildren } }
                      : tc
                  ),
                },
              }
            : b
        ));
        setSelectedBlockId(copy.id);
        toast.success('Block duplicated');
        return;
      }
    }
  };

  // ── Save / Publish handlers ───────────────────────────────────────────────

  const handleSave = () => triggerSave(false);

  const handlePublish = async () => {
    if (!onPublish) return;
    setIsSaving(true);
    try {
      await toast.promise(
        onPublish(latestData.current).then(() => {
          setIsDirty(false);
          setData((prev) => ({ ...prev, status: 'published' }));
        }),
        { loading: 'Publishing…', success: 'Published!', error: 'Publish failed' }
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnpublish = async () => {
    if (!onUnpublish) return;
    if (!confirm('Are you sure you want to unpublish? This will take the page offline.')) return;
    setIsSaving(true);
    try {
      await toast.promise(
        onUnpublish(latestData.current).then(() => {
          setIsDirty(false);
          setData((prev) => ({ ...prev, status: 'draft' }));
        }),
        { loading: 'Unpublishing…', success: 'Unpublished!', error: 'Unpublish failed' }
      );
    } finally {
      setIsSaving(false);
    }
  };

  const selectedBlock = selectedBlockId ? findBlock(blocks, selectedBlockId) : null;
  const parentRepeater = selectedBlockId ? findParentRepeater(blocks, selectedBlockId) : null;
  const repeaterContext = parentRepeater
    ? { collectionId: parentRepeater.collectionId ?? null }
    : null;

  // ── Mock entry for template mode ─────────────────────────────────────────
  // When editing a detail template, fetch the collection's field schema and
  // synthesise a fake entry so bound blocks render realistic sample content
  // instead of blank boxes.
  const templateCollectionId = useTemplateBuilderStore((s) => s.collectionId);
  const [mockEntry, setMockEntry] = useState<{ entryData: Record<string, any> } | null>(null);
  const [templateCollectionName, setTemplateCollectionName] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== 'template' || !templateCollectionId) {
      setMockEntry(null);
      setTemplateCollectionName(null);
      return;
    }
    let cancelled = false;
    fetch(`/api/collections/${templateCollectionId}`)
      .then((r) => r.json())
      .then((col) => {
        if (cancelled) return;
        const fields = Array.isArray(col?.fields) ? col.fields : [];
        setMockEntry({ entryData: buildMockEntryData(fields) });
        setTemplateCollectionName(typeof col?.name === 'string' ? col.name : null);
      })
      .catch(() => {
        if (!cancelled) {
          setMockEntry(null);
          setTemplateCollectionName(null);
        }
      });
    return () => { cancelled = true; };
  }, [mode, templateCollectionId]);

  return (
    <MockCollectionEntryContext.Provider value={mockEntry}>
    <EditorContext.Provider value={{ selectedBlockId, setSelectedBlockId }}>
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 h-14 border-b bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 sticky top-0 z-10 shrink-0">

        {/* Left: back + title + status */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/dashboard/pages"
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium hidden sm:inline">Pages</span>
          </Link>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 shrink-0" />

          <p className="text-sm font-semibold text-slate-800 dark:text-white truncate max-w-[200px]">
            {data.title || 'Untitled Page'}
          </p>

          <span
            className={cn(
              'text-[10px] px-2 py-0.5 rounded-full font-semibold border shrink-0',
              data.status === 'published'
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            )}
          >
            {data.status === 'published' ? 'Published' : 'Draft'}
          </span>

          {isDirty && (
            <span className="text-[10px] text-slate-400 hidden sm:block shrink-0">Unsaved changes</span>
          )}
        </div>

        {/* Center: view mode tabs */}
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
          <TabsList className="h-8 bg-slate-100 dark:bg-slate-800">
            <TabsTrigger value="edit" className="h-7 px-3 text-xs gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
              <Layout className="h-3.5 w-3.5" /> Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="h-7 px-3 text-xs gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
              <Eye className="h-3.5 w-3.5" /> Preview
            </TabsTrigger>
            <TabsTrigger value="json" className="h-7 px-3 text-xs gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
              <Code className="h-3.5 w-3.5" /> JSON
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Right: viewport toggle (preview only) + language toggle + actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Viewport toggle — only in Preview mode */}
          {activeTab === 'preview' && (
            <>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                {([
                  { key: 'desktop', label: 'Desktop', Icon: Monitor },
                  { key: 'tablet',  label: 'Tablet',  Icon: Tablet },
                  { key: 'mobile',  label: 'Mobile',  Icon: Smartphone },
                ] as const).map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setViewport(key)}
                    title={label}
                    aria-label={label}
                    aria-pressed={viewport === key}
                    className={cn(
                      'p-1.5 rounded-md transition-all',
                      viewport === key
                        ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                ))}
              </div>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            </>
          )}

          {/* Language toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setLanguage('en')}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded-md transition-all',
                language === 'en'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              )}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('ar')}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded-md transition-all',
                language === 'ar'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              )}
            >
              AR
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

          {/* View live */}
          {data.status === 'published' && (
            <Link
              href={`/${data.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View
            </Link>
          )}

          {/* Save draft */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs px-3"
            onClick={handleSave}
            disabled={isSaving || !isDirty}
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            Save
          </Button>

          {/* Publish / Unpublish */}
          {data.status === 'published' ? (
            <Button
              size="sm"
              variant="destructive"
              className="h-8 text-xs px-3"
              onClick={handleUnpublish}
              disabled={isSaving}
            >
              <Globe className="h-3.5 w-3.5 mr-1.5" />
              Unpublish
            </Button>
          ) : (
            <Button
              size="sm"
              className="h-8 text-xs px-3 bg-[#BC0D2A] hover:bg-[#9A0B22] text-white border-0"
              onClick={handlePublish}
              disabled={isSaving}
            >
              <Globe className="h-3.5 w-3.5 mr-1.5" />
              Publish
            </Button>
          )}
        </div>
      </header>

      {/* ── Main area ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {activeTab === 'edit' && (
          <>
            {/* Left: Block Selector */}
            <aside className="w-[220px] border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col shrink-0 overflow-y-auto">
              <BlockSelector onAdd={addBlock} />
            </aside>

            {/* Center: Canvas */}
            <main
              className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950"
              onClick={() => setSelectedBlockId(null)}
            >
              <div className="max-w-4xl mx-auto space-y-3 pb-24">
                {mode === 'template' && templateKind === 'detail' && templateCollectionId && (
                  <div
                    className="rounded-lg border border-[#BC0D2A]/20 bg-[#BC0D2A]/5 px-4 py-2.5 flex items-center gap-2 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Layout className="h-4 w-4 text-[#BC0D2A] shrink-0" />
                    <span className="text-slate-700 dark:text-slate-200">
                      Template for:{' '}
                      <span className="font-semibold">
                        {templateCollectionName ?? '…'}
                      </span>{' '}
                      collection
                    </span>
                  </div>
                )}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                    {blocks.map((block) => (
                      <div
                        key={block.id}
                        onClick={(e) => { e.stopPropagation(); setSelectedBlockId(block.id); }}
                        className={cn(
                          'ring-2 ring-transparent rounded-lg transition-shadow',
                          selectedBlockId === block.id && 'ring-[#BC0D2A]'
                        )}
                      >
                        {block.type === 'container' ? (
                          <ContainerEditorCard
                            block={block as { id: string; type: string; data: any; order: number }}
                            onChange={updateBlock}
                            onRemove={removeBlock}
                            onDuplicate={duplicateBlock}
                          />
                        ) : block.type === 'repeater' ? (
                          <RepeaterEditorCard
                            block={block as { id: string; type: string; data: any; order: number }}
                            onChange={updateBlock}
                            onRemove={removeBlock}
                            onDuplicate={duplicateBlock}
                          />
                        ) : (
                          <RenderEditor
                            block={block}
                            onChange={updateBlock}
                            onRemove={removeBlock}
                            onDuplicate={duplicateBlock}
                          />
                        )}
                      </div>
                    ))}
                  </SortableContext>

                  {blocks.length === 0 && (
                    <div className="text-center py-32 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 space-y-3">
                      <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit mx-auto">
                        <Plus className="h-6 w-6 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-600 dark:text-slate-300">
                          No blocks yet
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Select a block from the left panel to get started.
                        </p>
                      </div>
                    </div>
                  )}

                  <DragOverlay>
                    {activeDragId && (() => {
                      const dragBlock = findBlock(blocks, activeDragId);
                      if (!dragBlock) return null;
                      if (dragBlock.type === 'container') {
                        return (
                          <ContainerEditorCard
                            block={dragBlock as { id: string; type: string; data: any; order: number }}
                            onChange={() => {}}
                            onRemove={() => {}}
                            onDuplicate={() => {}}
                            isOverlay
                          />
                        );
                      }
                      if (dragBlock.type === 'repeater') {
                        return (
                          <RepeaterEditorCard
                            block={dragBlock as { id: string; type: string; data: any; order: number }}
                            onChange={() => {}}
                            onRemove={() => {}}
                            onDuplicate={() => {}}
                            isOverlay
                          />
                        );
                      }
                      return (
                        <RenderEditor
                          block={dragBlock}
                          onChange={() => {}}
                          onRemove={() => {}}
                          onDuplicate={() => {}}
                          isOverlay
                        />
                      );
                    })()}
                  </DragOverlay>
                </DndContext>
              </div>
            </main>

            {/* Right: Inspector */}
            <aside className="w-[280px] border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden lg:flex flex-col shrink-0">
              <Inspector
                selectedBlock={selectedBlock}
                onChange={updateBlock}
                pageData={data}
                mode={mode}
                repeaterContext={repeaterContext}
                onPageChange={(updates) => {
                  setData((prev) => ({ ...prev, ...updates }));
                  markDirty();
                }}
              />
            </aside>
          </>
        )}

        {activeTab === 'preview' && (
          <div
            className={cn(
              'flex-1 overflow-y-auto',
              viewport === 'desktop'
                ? 'bg-white'
                : 'bg-slate-100 dark:bg-slate-950 py-8'
            )}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            {/*
              @container/preview scopes container queries so that block
              styles (mobileBehavior, hideOnMobile) can respond to this
              wrapper's width rather than the browser viewport width —
              which is what makes the Tablet/Mobile toggle actually
              change layout instead of just cropping the content.
            */}
            <div
              className={cn(
                '@container/preview mx-auto bg-white transition-[max-width] duration-200',
                viewport === 'tablet' &&
                  'max-w-[768px] shadow-xl ring-1 ring-slate-200 dark:ring-slate-800',
                viewport === 'mobile' &&
                  'max-w-[390px] shadow-xl rounded-3xl overflow-hidden border border-slate-300 dark:border-slate-700'
              )}
            >
              <Navbar />
              <main>
                {blocks.length === 0 ? (
                  <div className="text-center py-32 text-slate-400 text-sm">
                    No blocks to preview. Switch to Edit tab to add blocks.
                  </div>
                ) : (
                  blocks.map((block) => <RenderPreview key={block.id} block={block} />)
                )}
              </main>
              <SiteFooter />
            </div>
          </div>
        )}

        {activeTab === 'json' && (
          <main className="flex-1 overflow-y-auto p-6 bg-slate-900">
            <pre className="bg-slate-950 text-green-400 p-6 rounded-xl text-xs font-mono overflow-auto max-w-5xl mx-auto leading-relaxed">
              {JSON.stringify(data, null, 2)}
            </pre>
          </main>
        )}
      </div>
    </div>
    </EditorContext.Provider>
    </MockCollectionEntryContext.Provider>
  );
}

// Friendly names for toast — avoids importing full registry on the hot path
const BLOCK_LABEL: Record<string, string> = {
  'hero': 'Hero',
  'rich-text': 'Rich Text',
  'image': 'Image',
  'video': 'Video',
  'columns': 'Columns',
  'cta': 'Call to Action',
  'form': 'Form',
  'spacer': 'Spacer',
  'collection-list': 'Collection List',
  'container': 'Container',
  'repeater': 'Repeater',
};
