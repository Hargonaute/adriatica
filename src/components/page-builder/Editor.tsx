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
import { EXTRA_BLOCK_META } from './BlockSelector';
import { BlockSidebar } from './BlockSidebar';
import { BLOCKS_REGISTRY } from './blocks/registry';
import { Inspector } from './Inspector';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Code, Layout, Save, Globe, ExternalLink, ArrowLeft, Plus, Monitor, Tablet, Smartphone, Loader2, Check, AlertCircle, Settings, X, Columns2, ClipboardCopy, Upload } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTemplateBuilderStore } from '@/lib/store/templateBuilderStore';
import { MockCollectionEntryContext } from '@/contexts/MockCollectionEntryContext';
import { buildMockEntryData } from '@/lib/mockEntryData';
import { NavbarShell } from '@/components/home/NavbarShell';
import { SiteFooter } from '@/components/home/SiteFooter';
import type { NavLink } from '@/components/home/nav-types';
import commonJson from '@/data/common.json';
import { pathForKey, type StaticPageKey } from '@/lib/i18n/pageSlugs';

const NAV_KEY_TO_PAGE_EDITOR: Record<string, StaticPageKey> = {
  rd: 'research-and-development',
  products: 'products',
  solution: 'solution',
  contact: 'contact',
};

function buildPreviewNavLinks(locale: 'en' | 'fr'): NavLink[] {
  const links = (commonJson as Record<'en' | 'fr', { nav: { links: { key: string; label: string }[] } }>)[locale].nav.links;
  return links.map((l) => {
    const pageKey = NAV_KEY_TO_PAGE_EDITOR[l.key];
    return { label: l.label, href: pageKey ? pathForKey(pageKey, locale) : `/${locale}` };
  });
}

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

// Props whose changes should reflect in the split-view preview in real time
// (150ms debounce). Text/content props are not listed here — those keep the
// blur-only sync path via the drawer-close effect, so we don't rerender the
// preview on every keystroke.
const STYLE_PROPS = new Set<string>([
  'backgroundColor', 'color', 'fontSize', 'fontWeight', 'textTransform',
  'aspectRatio', 'objectFit', 'width', 'borderRadius', 'layout', 'mobileBehavior',
  'showDivider', 'dividerColor', 'dividerStyle', 'imagePosition', 'variant',
  'align', 'size', 'striped', 'showDividers',
]);

const INSPECTOR_MIN = 200;
const INSPECTOR_MAX = 500;
const INSPECTOR_DEFAULT = 320;

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

// Lookup a block's icon + label for the drawer header. Handles ContainerBlock
// and RepeaterBlock (defined outside the registry) as special cases.
function getBlockMeta(type: string): { icon: React.ElementType; label: string } {
  const extra = EXTRA_BLOCK_META[type];
  if (extra) return { icon: extra.icon, label: extra.label };
  const reg = BLOCKS_REGISTRY[type];
  if (reg) return { icon: reg.icon, label: reg.label };
  return { icon: Layout, label: type };
}

export default function PageBuilderEditor({ initialData, mode = 'static', templateKind = null, onSave, onPublish, onUnpublish }: PageBuilderEditorProps) {
  const isTemplateMode = mode === 'template' && (templateKind === 'detail' || templateKind === 'index');
  const [data, setData] = useState<PageData>(initialData);
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'json'>('edit');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [pageSettingsOpen, setPageSettingsOpen] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const savedTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Split-view state ─────────────────────────────────────────────────────
  const [splitMode, setSplitMode] = useState(false);
  const [splitRatio, setSplitRatio] = useState(50);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewData, setPreviewData] = useState<PageData>(initialData);
  const [previewUpdating, setPreviewUpdating] = useState(false);
  const [wideScreen, setWideScreen] = useState(false);
  const [isResizingDivider, setIsResizingDivider] = useState(false);
  const [previewPanelWidth, setPreviewPanelWidth] = useState(0);
  const splitContainerRef = useRef<HTMLDivElement | null>(null);
  const previewPanelRef = useRef<HTMLDivElement | null>(null);
  const previewUpdatingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stylePreviewTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── JSON import state ────────────────────────────────────────────────────
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  // ── Inspector panel state ────────────────────────────────────────────────
  const [inspectorHeight, setInspectorHeight] = useState(INSPECTOR_DEFAULT);
  const [isResizingInspector, setIsResizingInspector] = useState(false);
  const leftPanelRef = useRef<HTMLDivElement | null>(null);

  // Drawer is open when a block is selected OR the user opened Page Settings.
  const drawerOpen = !!selectedBlockId || pageSettingsOpen;

  const closeDrawer = useCallback(() => {
    setSelectedBlockId(null);
    setPageSettingsOpen(false);
  }, []);

  // Escape closes the drawer (unless a Radix Popover / Dialog is open — those
  // handle Escape themselves and stop propagation).
  useEffect(() => {
    if (!drawerOpen) return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') closeDrawer();
    }
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [drawerOpen, closeDrawer]);

  // Reset viewport when leaving Preview mode
  useEffect(() => {
    if (activeTab !== 'preview') setViewport('desktop');
  }, [activeTab]);

  // ── Split view: wide-screen detection ────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(min-width: 1280px)');
    const update = () => setWideScreen(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  // ── Split view: load persisted preferences ───────────────────────────────
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('pb.splitMode');
      if (savedMode !== null) setSplitMode(savedMode === 'true');
      const savedRatio = localStorage.getItem('pb.splitRatio');
      if (savedRatio !== null) {
        const n = parseFloat(savedRatio);
        if (!isNaN(n) && n >= 30 && n <= 70) setSplitRatio(n);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('pb.splitMode', String(splitMode)); } catch {}
  }, [splitMode]);
  useEffect(() => {
    try { localStorage.setItem('pb.splitRatio', String(splitRatio)); } catch {}
  }, [splitRatio]);

  // ── Split view: commit preview on deselect / drawer close ────────────────
  useEffect(() => {
    if (!splitMode || !wideScreen) return;
    if (selectedBlockId || pageSettingsOpen) return;
    if (previewData === data) return;
    setPreviewUpdating(true);
    setPreviewData(data);
    if (previewUpdatingTimeout.current) clearTimeout(previewUpdatingTimeout.current);
    previewUpdatingTimeout.current = setTimeout(() => setPreviewUpdating(false), 400);
  }, [data, selectedBlockId, pageSettingsOpen, splitMode, wideScreen, previewData]);

  useEffect(() => {
    return () => { if (previewUpdatingTimeout.current) clearTimeout(previewUpdatingTimeout.current); };
  }, []);

  // ── Split view: divider drag ─────────────────────────────────────────────
  useEffect(() => {
    if (!isResizingDivider) return;
    const handleMove = (e: PointerEvent) => {
      const container = splitContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = (x / rect.width) * 100;
      setSplitRatio(Math.max(30, Math.min(70, pct)));
    };
    const handleUp = () => setIsResizingDivider(false);
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    const prevCursor = document.body.style.cursor;
    const prevSelect = document.body.style.userSelect;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevSelect;
    };
  }, [isResizingDivider]);

  // ── Inspector panel: load persisted height ───────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pb.inspectorHeight');
      if (saved !== null) {
        const n = parseFloat(saved);
        if (!isNaN(n)) {
          setInspectorHeight(Math.max(INSPECTOR_MIN, Math.min(INSPECTOR_MAX, n)));
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('pb.inspectorHeight', String(inspectorHeight)); } catch {}
  }, [inspectorHeight]);

  // ── Inspector panel: resize drag ─────────────────────────────────────────
  useEffect(() => {
    if (!isResizingInspector) return;
    const handleMove = (e: PointerEvent) => {
      const panel = leftPanelRef.current;
      if (!panel) return;
      const rect = panel.getBoundingClientRect();
      const h = rect.bottom - e.clientY;
      setInspectorHeight(Math.max(INSPECTOR_MIN, Math.min(INSPECTOR_MAX, h)));
    };
    const handleUp = () => setIsResizingInspector(false);
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    const prevCursor = document.body.style.cursor;
    const prevSelect = document.body.style.userSelect;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevSelect;
    };
  }, [isResizingInspector]);

  // ── Split view: track preview panel width for scroll hint ────────────────
  useEffect(() => {
    const el = previewPanelRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setPreviewPanelWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [splitMode, wideScreen, activeTab]);

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestData = useRef(data);
  latestData.current = data;

  // Debounced sync for style/appearance changes — fires 150ms after the last
  // style-prop update so the split-view preview reflects the change while the
  // Inspector is still open. Text/content edits use the blur-only path.
  const scheduleStylePreviewSync = useCallback(() => {
    if (!splitMode || !wideScreen) return;
    if (stylePreviewTimeout.current) clearTimeout(stylePreviewTimeout.current);
    stylePreviewTimeout.current = setTimeout(() => {
      setPreviewData(latestData.current);
      setPreviewUpdating(true);
      if (previewUpdatingTimeout.current) clearTimeout(previewUpdatingTimeout.current);
      previewUpdatingTimeout.current = setTimeout(() => setPreviewUpdating(false), 400);
    }, 150);
  }, [splitMode, wideScreen]);

  useEffect(() => {
    return () => { if (stylePreviewTimeout.current) clearTimeout(stylePreviewTimeout.current); };
  }, []);

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
    setSaveStatus('saving');
    if (savedTimeout.current) {
      clearTimeout(savedTimeout.current);
      savedTimeout.current = null;
    }
    try {
      await onSave(latestData.current);
      setIsDirty(false);
      setSaveStatus('saved');
      savedTimeout.current = setTimeout(() => setSaveStatus('idle'), 3000);
      if (!silent) toast.success('Draft saved');
    } catch {
      setSaveStatus('error');
      if (!silent) toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  }, [onSave]);

  useEffect(() => {
    return () => { if (savedTimeout.current) clearTimeout(savedTimeout.current); };
  }, []);

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
    // Real-time preview sync for style/appearance props only — content edits
    // still rely on the deselect-driven sync effect.
    if (Object.keys(updates).some((k) => STYLE_PROPS.has(k))) {
      scheduleStylePreviewSync();
    }
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

  // ── JSON import ──────────────────────────────────────────────────────────
  // Accepts three input shapes:
  //   1. Full PageData    — { blocks: { en: [...], fr?: [...] }, title?, meta? }
  //   2. Blocks object    — { en: [...], fr?: [...] }
  //   3. Block array      — Block[]   (loaded into the active language)
  const handleImportJson = useCallback(() => {
    setImportError(null);
    const raw = importJson.trim();
    if (!raw) { setImportError('Paste some JSON first.'); return; }

    let parsed: unknown;
    try { parsed = JSON.parse(raw); } catch (e) {
      setImportError(`Not valid JSON — ${(e as Error).message}`);
      return;
    }

    const normalizeBlockList = (arr: unknown): Block[] => {
      if (!Array.isArray(arr)) return [];
      return (arr as Record<string, unknown>[]).map((b, i) => ({
        ...b,
        id: (typeof b.id === 'string' && b.id) ? b.id : uuidv4(),
        order: typeof b.order === 'number' ? b.order : i,
      })) as Block[];
    };

    let newBlocks: { en: Block[]; fr?: Block[] };
    let newTitle: string | undefined;
    let newMeta: Partial<PageData['meta']> | undefined;

    if (Array.isArray(parsed)) {
      // Shape 3 — raw block array for the active language
      newBlocks = { ...data.blocks, [language]: normalizeBlockList(parsed) } as { en: Block[]; fr?: Block[] };
    } else if (parsed && typeof parsed === 'object') {
      const obj = parsed as Record<string, unknown>;

      if (obj.blocks && typeof obj.blocks === 'object' && !Array.isArray(obj.blocks)) {
        // Shape 1 — full PageData or { blocks: { en, fr? } }
        const b = obj.blocks as Record<string, unknown>;
        newBlocks = {
          en: normalizeBlockList(b.en ?? []),
          ...(Array.isArray(b.fr) ? { fr: normalizeBlockList(b.fr) } : {}),
        };
        if (typeof obj.title === 'string') newTitle = obj.title;
        if (obj.meta && typeof obj.meta === 'object') newMeta = obj.meta as Partial<PageData['meta']>;
      } else if (Array.isArray(obj.en)) {
        // Shape 2 — { en: [...], fr?: [...] }
        newBlocks = {
          en: normalizeBlockList(obj.en),
          ...(Array.isArray(obj.fr) ? { fr: normalizeBlockList(obj.fr) } : {}),
        };
      } else {
        setImportError('Unrecognised shape. Paste a Block[], a { en: Block[] } object, or full PageData JSON.');
        return;
      }
    } else {
      setImportError('Expected a JSON object or array.');
      return;
    }

    setData((prev) => ({
      ...prev,
      blocks: newBlocks,
      ...(newTitle !== undefined ? { title: newTitle } : {}),
      ...(newMeta !== undefined ? { meta: { ...prev.meta, ...newMeta } } : {}),
    }));
    markDirty();
    setImportJson('');
    setImportSuccess(true);
    setTimeout(() => setImportSuccess(false), 3000);

    // Auto-switch to whichever language has blocks so the canvas isn't empty
    const currentHasBlocks = (newBlocks[language as 'en' | 'fr'] ?? []).length > 0;
    const otherLang = language === 'en' ? 'fr' : 'en';
    const otherHasBlocks = (newBlocks[otherLang] ?? []).length > 0;
    if (!currentHasBlocks && otherHasBlocks) {
      setLanguage(otherLang);
      toast.success(`JSON imported — switched to ${otherLang.toUpperCase()} (that's where the blocks are).`);
    } else {
      toast.success('JSON imported successfully.');
    }

    setActiveTab('edit');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importJson, data.blocks, language]);

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
  const [templateBasePath, setTemplateBasePath] = useState<string | null>(null);
  const [firstEntrySlug, setFirstEntrySlug] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== 'template' || !templateCollectionId) {
      setMockEntry(null);
      setTemplateCollectionName(null);
      setTemplateBasePath(null);
      setFirstEntrySlug(null);
      return;
    }
    let cancelled = false;
    // Fetch collection metadata (fields + basePath) alongside published entries
    // so the header View button can point at a real live URL.
    Promise.all([
      fetch(`/api/collections/${templateCollectionId}`).then((r) => r.json()),
      fetch(`/api/entries?collectionId=${templateCollectionId}`).then((r) => r.json()).catch(() => []),
    ])
      .then(([col, entriesList]) => {
        if (cancelled) return;
        const fields = Array.isArray(col?.fields) ? col.fields : [];
        setMockEntry({ entryData: buildMockEntryData(fields) });
        setTemplateCollectionName(typeof col?.name === 'string' ? col.name : null);
        setTemplateBasePath(typeof col?.basePath === 'string' && col.basePath
          ? col.basePath
          : typeof col?.slug === 'string' ? col.slug : null);
        const firstPublished = Array.isArray(entriesList)
          ? entriesList.find((e: { status?: string; slug?: string | null }) =>
              e.status === 'published' && !!e.slug)
          : null;
        setFirstEntrySlug(firstPublished?.slug ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          setMockEntry(null);
          setTemplateCollectionName(null);
          setTemplateBasePath(null);
          setFirstEntrySlug(null);
        }
      });
    return () => { cancelled = true; };
  }, [mode, templateCollectionId]);

  // Resolve the URL for the header "View" button:
  // - detail template  → /collections/<basePath>/<first-published-entry-slug>
  // - index template   → /collections/<basePath>
  // - anything else    → /<page.slug>
  const liveHref: string | null = (() => {
    const L = language;
    if (isTemplateMode && templateBasePath) {
      if (templateKind === 'detail') {
        return firstEntrySlug
          ? `/${L}/collections/${templateBasePath}/${firstEntrySlug}`
          : `/${L}/collections/${templateBasePath}`;
      }
      if (templateKind === 'index') {
        return `/${L}/collections/${templateBasePath}`;
      }
    }
    if (data.status === 'published') return `/${L}/${data.slug}`;
    return null;
  })();

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
          {/* Split-view toggle — only in Edit tab; disabled on narrow screens */}
          {activeTab === 'edit' && (
            <>
              <button
                type="button"
                onClick={() => { if (wideScreen) setSplitMode((v) => !v); }}
                disabled={!wideScreen}
                aria-pressed={splitMode && wideScreen}
                title={wideScreen ? 'Toggle live preview' : 'Split view requires a wider screen'}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors',
                  !wideScreen
                    ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-700 text-slate-400'
                    : splitMode
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100'
                      : 'text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                )}
              >
                <Columns2 className="h-3.5 w-3.5" />
              </button>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            </>
          )}

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

          {/* Page Settings — opens the bottom drawer with SEO / metadata */}
          <button
            type="button"
            onClick={() => {
              setSelectedBlockId(null);
              setPageSettingsOpen((v) => !v);
            }}
            aria-pressed={pageSettingsOpen && !selectedBlockId}
            title="Page settings"
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors',
              pageSettingsOpen && !selectedBlockId
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100'
                : 'text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            )}
          >
            <Settings className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Settings</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

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
              onClick={() => setLanguage('fr')}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded-md transition-all',
                language === 'fr'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              )}
            >
              FR
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

          {/* View live */}
          {liveHref && (
            <Link
              href={liveHref}
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View
            </Link>
          )}

          {/* Save status indicator */}
          {saveStatus !== 'idle' && (
            <span
              className={cn(
                'flex items-center gap-1 text-xs',
                saveStatus === 'error'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-slate-500 dark:text-slate-400'
              )}
              role="status"
              aria-live="polite"
            >
              {saveStatus === 'saving' && (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving…
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <Check className="h-3 w-3 text-green-600" />
                  Saved
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <AlertCircle className="h-3 w-3" />
                  Save failed
                </>
              )}
            </span>
          )}

          {/* Save draft — template pages auto-publish on save, so their button
              says "Save & Publish" and no separate Publish button is shown. */}
          <Button
            variant={isTemplateMode ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'h-8 text-xs px-3',
              isTemplateMode && 'bg-[#BC0D2A] hover:bg-[#9A0B22] text-white border-0'
            )}
            onClick={handleSave}
            disabled={isSaving || !isDirty}
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            {isTemplateMode ? 'Save & Publish' : 'Save'}
          </Button>

          {/* Manual republish escape hatch for template pages whose
              published_blocks drifted from draft_blocks (e.g. saved before
              auto-publish landed). Bypasses the isDirty gate. */}
          {isTemplateMode && onPublish && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs px-3"
              onClick={handlePublish}
              disabled={isSaving}
            >
              <Globe className="h-3.5 w-3.5 mr-1.5" />
              Update Live Template
            </Button>
          )}

          {/* Publish / Unpublish — hidden in template mode (auto-published) */}
          {!isTemplateMode && (
            data.status === 'published' ? (
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
            )
          )}
        </div>
      </header>

      {/* ── Main area ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {activeTab === 'edit' && (() => {
          const showSplit = splitMode && wideScreen;
          const previewBlocks = data.blocks[language] || [];
          const previewViewportPx =
            previewViewport === 'desktop' ? 0 : previewViewport === 'tablet' ? 768 : 390;
          const showScrollHint =
            previewViewportPx > 0 && previewPanelWidth > 0 && previewPanelWidth < previewViewportPx + 16;
          return (
          <div className="flex-1 flex overflow-hidden">
          {/* Left block sidebar — collapsible, always visible */}
          <BlockSidebar onAdd={addBlock} />
          <div ref={splitContainerRef} className="flex-1 flex overflow-hidden">
          {/* Middle canvas + inspector panel (full width when split is off) */}
          <div
            ref={leftPanelRef}
            className="flex flex-col overflow-hidden min-w-0"
            style={showSplit ? { width: `${splitRatio}%` } : { flex: 1 }}
          >
            {/* Canvas — grows to fill remaining space above the inspector */}
            <main
              className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950"
              onClick={() => closeDrawer()}
            >
              <div className="max-w-4xl mx-auto space-y-3 pb-16">
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

                {/* Empty state — sidebar is where users add blocks now */}
                {blocks.length === 0 && (
                  <div
                    className="text-center py-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 space-y-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit mx-auto">
                      <Plus className="h-6 w-6 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-600 dark:text-slate-300">
                        No blocks yet
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Pick a block from the sidebar to get started.
                      </p>
                    </div>
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setPageSettingsOpen(false);
                          setSelectedBlockId(block.id);
                        }}
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

            {/* Bottom Inspector panel — pushes the canvas up rather than
                overlapping it. Only rendered when a block is selected or
                Page Settings is open, so the canvas reclaims full height
                the rest of the time. */}
            {drawerOpen && (
              <div
                className="shrink-0 flex flex-col bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800"
                style={{ height: `${inspectorHeight}px` }}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-label={selectedBlock ? 'Block inspector' : 'Page settings'}
              >
                {/* Resize handle */}
                <div
                  onPointerDown={(e) => { e.preventDefault(); setIsResizingInspector(true); }}
                  onDoubleClick={() => setInspectorHeight(INSPECTOR_DEFAULT)}
                  role="separator"
                  aria-orientation="horizontal"
                  aria-label="Resize inspector"
                  title="Drag to resize · double-click to reset"
                  className={cn(
                    'h-1 shrink-0 cursor-row-resize transition-colors',
                    isResizingInspector
                      ? 'bg-[#BC0D2A]/70'
                      : 'bg-slate-200 dark:bg-slate-800 hover:bg-[#BC0D2A]/50'
                  )}
                />
                {(() => {
                  const meta = selectedBlock
                    ? getBlockMeta(selectedBlock.type)
                    : { icon: Settings, label: 'Page Settings' };
                  const HeaderIcon = meta.icon;
                  return (
                    <div className="sticky top-0 z-10 flex items-center justify-between px-4 h-11 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-950/40">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shrink-0">
                          <HeaderIcon className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                        </div>
                        <span className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                          {meta.label}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={closeDrawer}
                        aria-label="Close"
                        className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })()}
                <div className="flex-1 overflow-y-auto">
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
                </div>
              </div>
            )}
          </div>

          {/* Resizable divider */}
          {showSplit && (
            <div
              onPointerDown={(e) => { e.preventDefault(); setIsResizingDivider(true); }}
              onDoubleClick={() => setSplitRatio(50)}
              role="separator"
              aria-label="Resize split view"
              aria-orientation="vertical"
              title="Drag to resize · double-click to reset"
              className={cn(
                'w-1 shrink-0 cursor-col-resize transition-colors z-30',
                isResizingDivider
                  ? 'bg-[#BC0D2A]/70'
                  : 'bg-slate-200 dark:bg-slate-800 hover:bg-[#BC0D2A]/50'
              )}
            />
          )}

          {/* Right preview panel */}
          {showSplit && (
            <div
              ref={previewPanelRef}
              className="relative flex flex-col overflow-hidden min-w-0 bg-slate-100 dark:bg-slate-950"
              style={{ width: `${100 - splitRatio}%` }}
            >
              {/* Mini-toolbar */}
              <div className="flex items-center justify-between px-3 h-10 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Live Preview
                </span>
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                  {([
                    { key: 'desktop', label: 'Desktop', Icon: Monitor },
                    { key: 'tablet',  label: 'Tablet',  Icon: Tablet },
                    { key: 'mobile',  label: 'Mobile',  Icon: Smartphone },
                  ] as const).map(({ key, label, Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPreviewViewport(key)}
                      title={label}
                      aria-label={label}
                      aria-pressed={previewViewport === key}
                      className={cn(
                        'p-1.5 rounded-md transition-all',
                        previewViewport === key
                          ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Updating indicator */}
              <div
                className={cn(
                  'h-0.5 shrink-0 overflow-hidden transition-opacity duration-200',
                  previewUpdating ? 'opacity-100' : 'opacity-0'
                )}
                aria-hidden={!previewUpdating}
              >
                <div className="h-full bg-[#BC0D2A] animate-pulse" />
              </div>

              {/* Scroll hint when panel is narrower than the selected viewport */}
              {showScrollHint && (
                <div className="px-3 py-1 text-[10px] text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-900/30 shrink-0">
                  Preview is wider than the panel — scroll horizontally to see more.
                </div>
              )}

              {/* Preview content */}
              <div
                className={cn(
                  'flex-1 overflow-auto',
                  previewViewport === 'desktop' ? 'bg-white' : 'bg-slate-100 dark:bg-slate-950 py-6'
                )}
                dir="ltr"
              >
                <div
                  className={cn(
                    '@container/preview mx-auto bg-white transition-[max-width] duration-200',
                    previewViewport === 'desktop' && 'w-full',
                    previewViewport === 'tablet' &&
                      'w-[768px] max-w-[768px] shadow-xl ring-1 ring-slate-200 dark:ring-slate-800',
                    previewViewport === 'mobile' &&
                      'w-[390px] max-w-[390px] shadow-xl rounded-3xl overflow-hidden border border-slate-300 dark:border-slate-700'
                  )}
                >
                  <NavbarShell locale={language} links={buildPreviewNavLinks(language)} />
                  <main>
                    {previewBlocks.length === 0 ? (
                      <div className="text-center py-32 text-slate-400 text-sm">
                        No blocks to preview.
                      </div>
                    ) : (
                      previewBlocks.map((block) => <RenderPreview key={block.id} block={block} />)
                    )}
                  </main>
                  <SiteFooter locale={language} />
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
        );
        })()}

        {activeTab === 'preview' && (
          <div
            className={cn(
              'flex-1 overflow-y-auto',
              viewport === 'desktop'
                ? 'bg-white'
                : 'bg-slate-100 dark:bg-slate-950 py-8'
            )}
            dir="ltr"
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
              <NavbarShell locale={language} links={buildPreviewNavLinks(language)} />
              <main>
                {blocks.length === 0 ? (
                  <div className="text-center py-32 text-slate-400 text-sm">
                    No blocks to preview. Switch to Edit tab to add blocks.
                  </div>
                ) : (
                  blocks.map((block) => <RenderPreview key={block.id} block={block} />)
                )}
              </main>
              <SiteFooter locale={language} />
            </div>
          </div>
        )}

        {activeTab === 'json' && (
          <main className="flex-1 overflow-y-auto p-6 bg-slate-900 space-y-6">
            <div className="max-w-5xl mx-auto space-y-6">

              {/* ── Current page JSON ───────────────────────────── */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                    Current page JSON
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                      toast.success('Copied to clipboard');
                    }}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-2.5 py-1 rounded-md transition-colors"
                  >
                    <ClipboardCopy className="h-3.5 w-3.5" />
                    Copy
                  </button>
                </div>
                <pre className="bg-slate-950 text-green-400 p-6 rounded-xl text-xs font-mono overflow-auto leading-relaxed max-h-[40vh]">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>

              {/* ── Import JSON ──────────────────────────────────── */}
              <div className="bg-slate-800 rounded-xl p-5 space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white flex items-center gap-2">
                    <Upload className="h-4 w-4 text-[#BC0D2A]" />
                    Import JSON
                  </p>
                  <p className="text-xs text-slate-400">
                    Paste AI-generated JSON below. Accepted formats:
                    full <code className="text-slate-300">PageData</code>,
                    a <code className="text-slate-300">{'{ en: Block[] }'}</code> object,
                    or a raw <code className="text-slate-300">Block[]</code> array (loads into the active language).
                  </p>
                </div>

                {/* AI prompt hint */}
                <details className="group">
                  <summary className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer select-none list-none flex items-center gap-1">
                    <span className="group-open:rotate-90 inline-block transition-transform">▶</span>
                    Show example AI prompt
                  </summary>
                  <div className="mt-2 rounded-lg bg-slate-900 border border-slate-700 p-3">
                    <p className="text-[11px] text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">{`Generate a Blueprint CMS page JSON for a [describe your page].

Return ONLY valid JSON matching this shape — no explanation, no markdown fences:
{
  "blocks": {
    "en": [ ...Block objects... ],
    "fr": [ ...same blocks translated... ]
  },
  "title": "Page Title"
}

Available block types and their required data fields:
- hero: { headline, subheadline, ctaLabel, ctaUrl, backgroundImage }
- rich-text: { content } (HTML string)
- section-heading: { heading, subheading, align, size, showDivider }
- cta: { headline, body, primaryLabel, primaryUrl, secondaryLabel, secondaryUrl }
- columns: { columns (2|3|4), items: [{ id, icon, title, body }] }
- image: { url, alt, caption }
- video: { url, title }
- table: { headers, rows, striped, bordered }
- key-value-list: { heading, items: [{ id, label, value }], striped, showDividers }
- spacer: { size (xs|sm|md|lg|xl), showDivider }
- button: { label, url, variant (primary|outline|ghost), align }
- download-button: { label, url, icon (download|file|none), variant, openInNewTab }
- newsletter: { heading, body, buttonLabel, imageUrl }
- contact-form-simple: { heading, body, imageUrl }
- product-hero: { title, subtitle1, body, ctaLabel, ctaUrl, image, imagePosition (left|right) }
- catalogue: { heading, ctaLabel, imageUrl, imageAlt }

Every block must also include: { id (uuid), type, order (integer), paddingTop, paddingBottom, align, maxWidth, background }
Padding values: none | sm | md | lg | xl
Background values: none | muted | dark | brand-red | brand-green | navy
MaxWidth values: sm | md | lg | full`}</p>
                  </div>
                </details>

                <textarea
                  value={importJson}
                  onChange={(e) => { setImportJson(e.target.value); setImportError(null); }}
                  placeholder={'Paste JSON here…'}
                  rows={10}
                  className="w-full bg-slate-950 text-green-300 placeholder:text-slate-600 text-xs font-mono p-4 rounded-lg border border-slate-700 focus:border-[#BC0D2A] focus:outline-none resize-y"
                  spellCheck={false}
                />

                {importError && (
                  <div className="flex items-start gap-2 rounded-lg bg-red-950/40 border border-red-800 px-3 py-2 text-xs text-red-300">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    {importError}
                  </div>
                )}

                {importSuccess && (
                  <div className="flex items-center gap-2 rounded-lg bg-green-950/40 border border-green-800 px-3 py-2 text-xs text-green-300">
                    <Check className="h-3.5 w-3.5 shrink-0" />
                    Imported! Switching to Edit tab…
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleImportJson}
                    disabled={!importJson.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#BC0D2A] hover:bg-[#9A0B22] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Apply JSON to page
                  </button>
                  {importJson && (
                    <button
                      type="button"
                      onClick={() => { setImportJson(''); setImportError(null); }}
                      className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

            </div>
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
  'product-hero': 'Product Hero',
  'section-heading': 'Section Heading',
  'key-value-list': 'Key-Value List',
  'download-button': 'Download Button',
};
