import { createContext, useContext } from 'react';

export interface CollectionItemCtx {
  itemId: string;
  collectionSlug: string;
}

export const CollectionItemContext = createContext<CollectionItemCtx | null>(null);
export const useCollectionItem = () => useContext(CollectionItemContext);
