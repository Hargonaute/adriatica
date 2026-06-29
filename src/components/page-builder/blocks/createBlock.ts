import { v4 as uuidv4 } from 'uuid';
import { type Block, type BlockData } from '@/types';
import { BLOCKS_REGISTRY, type BlockType } from './registry';

/**
 * Creates a new block instance with a unique ID.
 * @param type The type of block to create (must correspond to a key in BLOCKS_REGISTRY)
 * @param order The numeric order for the block
 */
export function createBlock(type: BlockType, order: number): Block {
  const registryEntry = BLOCKS_REGISTRY[type];
  
  if (!registryEntry) {
    throw new Error(`Block type "${type}" is not registered.`);
  }

  const defaultData = registryEntry.createDefault();

  // Base settings come first so createDefault() can override them
  const data: BlockData = {
    paddingTop: 'md',
    paddingBottom: 'md',
    align: 'left',
    maxWidth: 'full',
    background: 'none',
    hideOnMobile: false,
    ...defaultData,
    type: type as any,
  } as BlockData;

  return {
    id: uuidv4(),
    type: type as any, // Cast to avoid generic inference issues
    order,
    data,
  };
}
