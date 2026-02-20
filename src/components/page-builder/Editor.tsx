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
import { type PageData, type Block, type BlockData } from '@/types';
import { createBlock } from './blocks/createBlock';
import { RenderEditor } from './renderEditor';
import { RenderPreview } from './renderPreview';
import { BlockSelector } from './BlockSelector';
import { Inspector } from './Inspector';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Code, Layout, Save, Globe, ExternalLink, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PageBuilderEditorProps {
  initialData: PageData;
  onSave?: (data: PageData) => Promise<void>;
  onPublish?: (data: PageData) => Promise<void>;
  onUnpublish?: (data: PageData) => Promise<void>;
}

const AUTO_SAVE_DELAY = 30_000; // 30 seconds

export default function PageBuilderEditor({ initialData, onSave, onPublish, onUnpublish }: PageBuilderEditorProps) {
  const [data, setData] = useState<PageData>(initialData);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'json'>('edit');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    setBlocks(arrayMove(blocks, oldIndex, newIndex).map((b, i) => ({ ...b, order: i })));
  };

  const addBlock = (type: any) => {
    const newBlock = createBlock(type, blocks.length);
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
    toast.success(`Added ${BLOCK_LABEL[type] ?? type} block`);
  };

  const updateBlock = (id: string, updates: Partial<BlockData>) => {
    setBlocks(blocks.map((b) => b.id === id ? { ...b, data: { ...b.data, ...updates } } : b));
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
    toast.success('Block removed');
  };

  const duplicateBlock = (id: string) => {
    const source = blocks.find((b) => b.id === id);
    if (!source) return;
    const idx = blocks.findIndex((b) => b.id === id);
    const copy: Block = { ...source, id: uuidv4(), order: idx + 1 };
    const next = [
      ...blocks.slice(0, idx + 1),
      copy,
      ...blocks.slice(idx + 1),
    ].map((b, i) => ({ ...b, order: i }));
    setBlocks(next);
    setSelectedBlockId(copy.id);
    toast.success('Block duplicated');
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

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) ?? null;

  return (
    <div className="flex flex-col h-screen bg-muted/10">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b bg-background sticky top-0 z-10">
           <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold tracking-tight">{data.title || 'Untitled Page'}</h1>
              <div className="ml-4 flex items-center bg-muted rounded-lg p-1">
                 <Button 
                    variant={language === 'en' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    onClick={() => setLanguage('en')}
                    className="text-xs h-7"
                 >
                    EN
                 </Button>
                 <Button 
                    variant={language === 'ar' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    onClick={() => setLanguage('ar')}
                    className="text-xs h-7"
                 >
                    AR
                 </Button>
              </div>
              <div className="flex items-center gap-2 ml-2">
                  <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full border",
                      data.status === 'published' ? "bg-green-100 text-green-700 border-green-200" : "bg-yellow-100 text-yellow-700 border-yellow-200"
                  )}>
                      {data.status === 'published' ? 'Published' : 'Draft'}
                  </span>
              </div>
           </div>

           <div className="flex items-center gap-2">
               <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="mr-4">
                  <TabsList className="grid w-[200px] grid-cols-3">
                     <TabsTrigger value="edit"><Layout className="h-4 w-4" /></TabsTrigger>
                     <TabsTrigger value="preview"><Eye className="h-4 w-4" /></TabsTrigger>
                     <TabsTrigger value="json"><Code className="h-4 w-4" /></TabsTrigger>
                  </TabsList>
               </Tabs>
               
               <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving || !isDirty}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
               </Button>
               
               {data.status === 'published' ? (
                   <Button size="sm" variant="destructive" onClick={handleUnpublish} disabled={isSaving}>
                      <Globe className="h-4 w-4 mr-2" />
                      Unpublish
                   </Button>
               ) : (
                   <Button size="sm" onClick={handlePublish} disabled={isSaving}>
                      <Globe className="h-4 w-4 mr-2" />
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
            <aside className="w-[220px] border-r bg-background hidden md:flex flex-col z-0 overflow-y-auto">
              <BlockSelector onAdd={addBlock} />
            </aside>

            {/* Center: Canvas */}
            <main
              className="flex-1 overflow-y-auto p-6 bg-muted/20"
              onClick={() => setSelectedBlockId(null)}
            >
              <div className="max-w-4xl mx-auto space-y-3 pb-24">
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
                          selectedBlockId === block.id && 'ring-primary'
                        )}
                      >
                        <RenderEditor
                          block={block}
                          onChange={updateBlock}
                          onRemove={removeBlock}
                          onDuplicate={duplicateBlock}
                        />
                      </div>
                    ))}
                  </SortableContext>

                  {blocks.length === 0 && (
                    <div className="text-center py-24 border-2 border-dashed rounded-xl text-muted-foreground space-y-2">
                      <p className="font-medium">No blocks yet</p>
                      <p className="text-sm">Click a block from the left panel to get started.</p>
                    </div>
                  )}

                  <DragOverlay>
                    {activeDragId && (
                      <RenderEditor
                        block={blocks.find((b) => b.id === activeDragId)!}
                        onChange={() => {}}
                        onRemove={() => {}}
                        onDuplicate={() => {}}
                        isOverlay
                      />
                    )}
                  </DragOverlay>
                </DndContext>
              </div>
            </main>

            {/* Right: Inspector */}
            <aside className="w-[280px] border-l bg-background hidden lg:flex flex-col z-0">
              <Inspector
                selectedBlock={selectedBlock}
                onChange={updateBlock}
                pageData={data}
                onPageChange={(updates) => {
                  setData((prev) => ({ ...prev, ...updates }));
                  markDirty();
                }}
              />
            </aside>
          </>
        )}

        {activeTab === 'preview' && (
          <main
            className="flex-1 overflow-y-auto bg-background"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            {blocks.length === 0 ? (
              <div className="text-center py-24 text-muted-foreground text-sm">
                No blocks to preview. Switch to Edit tab to add blocks.
              </div>
            ) : (
              blocks.map((block) => <RenderPreview key={block.id} block={block} />)
            )}
          </main>
        )}

        {activeTab === 'json' && (
          <main className="flex-1 overflow-y-auto p-6 bg-muted/90">
            <pre className="bg-background p-4 rounded-lg shadow-sm text-xs font-mono overflow-auto max-w-5xl mx-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </main>
        )}
      </div>
    </div>
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
};
