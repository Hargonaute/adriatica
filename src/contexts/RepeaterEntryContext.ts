import { createContext, useContext } from 'react';

export interface RepeaterEntryCtx {
  /** The full data record for the current entry being rendered. */
  entryData: Record<string, any>;
  /** The collection slug (used to build /collections/{slug}/{itemId} links). */
  collectionSlug: string | null;
}

/**
 * Provided by RepeaterPreview for each entry card it renders.
 * Consumed by BoundBlock Preview components to read field values
 * without making individual API calls per block.
 */
export const RepeaterEntryContext = createContext<RepeaterEntryCtx | null>(null);
export const useRepeaterEntry = () => useContext(RepeaterEntryContext);
