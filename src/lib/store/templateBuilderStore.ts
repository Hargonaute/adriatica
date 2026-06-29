/**
 * Zustand store for the **template builder** only.
 *
 * Tracks which block is selected, which collection the template is bound to,
 * and the per-block field bindings (blockId → fieldKey).
 *
 * Do NOT use this store in the static page builder. The static builder manages
 * all state locally via React useState/useRef and must remain independent.
 */
import { create } from 'zustand';

interface TemplateBuilderState {
  /** The id of the block currently selected in the template canvas, or null. */
  selectedBlockId: string | null;

  /** UUID of the collection this template is bound to, or null. */
  collectionId: string | null;

  /**
   * Maps each block id to the field key it is bound to.
   * e.g. { "block-abc": "title", "block-def": "hero_image" }
   */
  bindings: Record<string, string>;

  /** Select (or deselect) a block in the canvas. */
  setSelectedBlock: (id: string | null) => void;

  /**
   * Set the active collection for this template.
   * If the id differs from the current collectionId, bindings are cleared automatically.
   */
  setCollection: (id: string | null) => void;

  /** Bind a block to a field key. Overwrites any existing binding for that block. */
  setBinding: (blockId: string, fieldKey: string) => void;

  /** Remove the binding for a single block (e.g. when the block is deleted). */
  removeBinding: (blockId: string) => void;

  /** Clear all bindings. Called implicitly by setCollection when the collection changes. */
  clearBindings: () => void;
}

export const useTemplateBuilderStore = create<TemplateBuilderState>((set, get) => ({
  selectedBlockId: null,
  collectionId: null,
  bindings: {},

  setSelectedBlock: (id) => set({ selectedBlockId: id }),

  setCollection: (id) => {
    const current = get().collectionId;
    if (id !== current) {
      set({ collectionId: id, bindings: {} });
    } else {
      set({ collectionId: id });
    }
  },

  setBinding: (blockId, fieldKey) =>
    set((state) => ({
      bindings: { ...state.bindings, [blockId]: fieldKey },
    })),

  removeBinding: (blockId) =>
    set((state) => {
      const next = { ...state.bindings };
      delete next[blockId];
      return { bindings: next };
    }),

  clearBindings: () => set({ bindings: {} }),
}));
