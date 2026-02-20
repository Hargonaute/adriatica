import { z } from 'zod';
import { type PageData } from '@/types';
import { BLOCKS_REGISTRY } from '@/components/page-builder/blocks/registry';

// Basic Schema Validation using Zod
// We can expand this to use registry.validate for specifics

const BaseBlockSettingsSchema = z.object({
  paddingTop: z.enum(['none', 'sm', 'md', 'lg', 'xl']).optional(),
  paddingBottom: z.enum(['none', 'sm', 'md', 'lg', 'xl']).optional(),
  align: z.enum(['left', 'center', 'right']).optional(),
  maxWidth: z.enum(['sm', 'md', 'lg', 'full']).optional(),
  background: z.enum(['none', 'muted', 'dark', 'image']).optional(),
  hideOnMobile: z.boolean().optional(),
  customClassName: z.string().optional(),
});

const BlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  order: z.number(),
  data: BaseBlockSettingsSchema.passthrough(), // Allow other keys, type-specific validation below
});

const PageMetaSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  ogImage: z.string().optional(),
  canonical: z.string().optional(),
  noIndex: z.boolean().optional(),
});

const PageDataSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  blocks: z.object({
    en: z.array(BlockSchema),
    ar: z.array(BlockSchema).optional(),
  }),
  meta: PageMetaSchema,
  status: z.enum(['draft', 'published']),
  schemaVersion: z.number(),
});

export function validatePageData(data: unknown): { success: boolean; error?: string; data?: PageData } {
  const result = PageDataSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(', '),
    };
  }

  // Deep validation using registry (optional)
  // We can iterate over blocks and call registry[type].validate if it exists
  const typedData = result.data as PageData;
  const allBlocks = [...typedData.blocks.en, ...(typedData.blocks.ar || [])];

  for (const block of allBlocks) {
    const registryEntry = BLOCKS_REGISTRY[block.type];
    if (registryEntry?.validate) {
      const validation = registryEntry.validate(block.data);
      if (validation && !validation.success) {
        return {
           success: false,
           error: `Block ${block.id} (${block.type}) validation failed: ${validation.error}`,
        };
      }
    }
  }

  return { success: true, data: typedData };
}
