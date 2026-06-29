import { z } from 'zod';
import { type PageData } from '@/types';
import { BLOCKS_REGISTRY } from '@/components/page-builder/blocks/registry';

// Basic Schema Validation using Zod
// We can expand this to use registry.validate for specifics

// All declared fields are optional. `.passthrough()` is applied below so any
// future block-specific keys (e.g. RepeaterBlockData.cardTemplate,
// ContainerBlockData.children, bound block fieldKey) survive the publish
// pipeline without needing a schema change. Declarations below document the
// fields the Inspector writes today — keeping them explicit prevents a
// future `.strict()` swap from silently stripping them.
const BaseBlockSettingsSchema = z.object({
  // Layout (static + template)
  paddingTop: z.enum(['none', 'sm', 'md', 'lg', 'xl']).optional(),
  paddingBottom: z.enum(['none', 'sm', 'md', 'lg', 'xl']).optional(),
  align: z.enum(['left', 'center', 'right']).optional(),
  maxWidth: z.enum(['sm', 'md', 'lg', 'full']).optional(),
  background: z.enum(['none', 'muted', 'dark', 'image', 'brand-red', 'brand-green', 'navy']).optional(),
  hideOnMobile: z.boolean().optional(),
  customClassName: z.string().optional(),

  // Typography (template mode)
  fontSize: z.string().optional(),
  fontWeight: z.string().optional(),
  textAlign: z.string().optional(),
  textColor: z.string().optional(),

  // Box / colour (template mode + container)
  backgroundColor: z.string().optional(),
  borderWidth: z.string().optional(),
  borderRadius: z.string().optional(),
  borderColor: z.string().optional(),
  padding: z.string().optional(),
  margin: z.string().optional(),

  // Flex / grid (template mode + container)
  gap: z.string().optional(),
  gridColumns: z.string().optional(),
  flexDirection: z.string().optional(),
  alignItems: z.string().optional(),
  justifyContent: z.string().optional(),

  // Media (template mode)
  aspectRatio: z.string().optional(),
  objectFit: z.string().optional(),

  // Container-specific
  direction: z.enum(['row', 'column']).optional(),
  containerGap: z.enum(['none', 'sm', 'md', 'lg']).optional(),
  containerPadding: z.enum(['none', 'sm', 'md', 'lg']).optional(),
  children: z.array(z.any()).optional(),

  // Repeater-specific
  collectionId: z.string().optional(),
  collectionSlug: z.string().optional(),
  columns: z.union([z.string(), z.number()]).optional(),
  repeaterGap: z.enum(['sm', 'md', 'lg']).optional(),
  cardTemplate: z.array(z.any()).optional(),

  // Bound-block field binding
  fieldKey: z.string().nullable().optional(),
});

const BlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  order: z.number(),
  // .passthrough() keeps any per-block-type keys (hero.headline, image.url,
  // rich-text.content, etc.) that aren't declared above. Deep per-type
  // validation runs below via BLOCKS_REGISTRY[type].validate.
  data: BaseBlockSettingsSchema.passthrough(),
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
