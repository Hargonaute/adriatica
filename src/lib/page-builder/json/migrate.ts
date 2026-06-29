import { type PageData, type Block, type BlockData } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Define Legacy Types to help with migration typing
type LegacyBlock = {
  id?: string;
  type: string;
  order?: number;
  // Legacy fields
  src?: string; // used in image/video
  variant?: string; // used in button
  name?: string; // used in chart
  [key: string]: any;
};

type LegacyPageData = {
  id: string;
  title: string;
  blocks?: LegacyBlock[]; // Old array format
  meta?: any;
  status?: string;
  [key: string]: any;
};

const CURRENT_SCHEMA_VERSION = 1;

/**
 * Migrates a single block from legacy format to canonical format.
 */
function migrateBlock(block: LegacyBlock, order: number): Block {
  const newId = block.id || uuidv4();
  const type = block.type;
  
  // New format stores settings nested in block.data; legacy stores them at top level.
  const source = (block.data && typeof block.data === 'object') ? block.data : block;
  const data: Partial<BlockData> & Record<string, any> = { ...source };
  
  // Specific migrations
  if ((type === 'image' || type === 'video') && block.src && !block.url) {
    data.url = block.src;
    delete data.src;
  }

  if (type === 'button' && block.variant && !data.styleType) {
    data.styleType = block.variant;
    delete data.variant;
  }

  if (type === 'chart' && block.name && !data.label) {
    data.label = block.name;
    delete data.name;
  }

  // Ensure base settings exist with defaults
  if (!data.paddingTop) data.paddingTop = 'md';
  if (!data.paddingBottom) data.paddingBottom = 'md';
  if (!data.align) data.align = 'left';
  if (!data.maxWidth) data.maxWidth = 'full';
  if (!data.background) data.background = 'none';

  // Clean up block wrapper fields from data if they leaked
  delete data.id;
  delete data.order;
  delete data.type;

  return {
    id: newId,
    type: type as any,
    order: typeof block.order === 'number' ? block.order : order,
    data: data as BlockData,
  };
}

/**
 * Main migration function.
 * Converts ANY input JSON into a valid PageData object (types permitting).
 */
export function migratePageData(payload: any): PageData {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid payload: must be an object');
  }

  const result: PageData = {
    id: payload.id || uuidv4(),
    slug: payload.slug || payload.meta?.slug || `page-${Date.now()}`,
    title: payload.title || 'Untitled Page',
    blocks: {
      en: [],
      ar: [], // Initialize empty if missing
    },
    meta: {
      // Spread all stored meta fields so nothing is lost across editor round-trips.
      // Then apply defaults for fields that may not exist yet.
      ...((payload.meta && typeof payload.meta === 'object') ? payload.meta : {}),
      title: payload.meta?.title || payload.title,
      description: payload.meta?.description ?? '',
    },
    status: (payload.status === 'published' ? 'published' : 'draft'),
    schemaVersion: CURRENT_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
  };

  // 1. Handle legacy `blocks` array -> move to `blocks.en`
  if (Array.isArray(payload.blocks)) {
    // It's the old format with single blocks array
    result.blocks.en = payload.blocks.map((b: LegacyBlock, i: number) => migrateBlock(b, i));
  } else if (payload.blocks && typeof payload.blocks === 'object') {
    // It's likely the new format { en: [], ar: [] }
    // Ensure en exists
    if (Array.isArray(payload.blocks.en)) {
      result.blocks.en = payload.blocks.en.map((b: LegacyBlock, i: number) => migrateBlock(b, i));
    }
    // Ensure ar exists
    if (Array.isArray(payload.blocks.ar)) {
      result.blocks.ar = payload.blocks.ar.map((b: LegacyBlock, i: number) => migrateBlock(b, i));
    }
  }

  return result;
}
