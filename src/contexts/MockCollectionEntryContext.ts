'use client';

import { createContext, useContext } from 'react';

export interface MockCollectionEntryCtx {
  /** Fake entry data keyed by field key — one entry per field, seeded from the schema. */
  entryData: Record<string, any>;
}

/**
 * Provided by the template editor when editing a DETAIL template so bound blocks
 * can render realistic sample content in the absence of a real collection entry.
 *
 * Read by bound block Previews AFTER {@link RepeaterEntryContext} but BEFORE
 * {@link CollectionItemContext} — a real entry always wins.
 */
export const MockCollectionEntryContext = createContext<MockCollectionEntryCtx | null>(null);
export const useMockCollectionEntry = () => useContext(MockCollectionEntryContext);
