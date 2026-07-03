import { createContext, useContext } from 'react';

export interface CollectionItemCtxField {
  id: string;
  key: string;
  label: string;
  type: string;
  required?: boolean;
  order?: number;
}

export interface CollectionItemCtxEntry {
  id: string;
  slug: string | null;
  collectionId: string;
  data: Record<string, unknown>;
}

export interface CollectionItemCtxCollection {
  id: string;
  name: string;
  slug: string;
  fields: CollectionItemCtxField[];
}

export interface CollectionItemCtx {
  itemId: string;
  collectionSlug: string;
  /** Full entry payload — provided by the site-side TemplateRenderer so
   * bound blocks and collection-item-fields can render synchronously
   * without a client-side fetch. */
  entry?: CollectionItemCtxEntry;
  /** Collection metadata (used by collection-item-fields to draw labels). */
  collection?: CollectionItemCtxCollection;
}

export const CollectionItemContext = createContext<CollectionItemCtx | null>(null);
export const useCollectionItem = () => useContext(CollectionItemContext);
