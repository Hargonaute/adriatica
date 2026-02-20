import { type LucideIcon } from 'lucide-react';

// --- Base Block Settings (Shared) ---
export interface BaseBlockSettings {
  paddingTop?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  paddingBottom?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'left' | 'center' | 'right';
  maxWidth?: 'sm' | 'md' | 'lg' | 'full';
  background?: 'none' | 'muted' | 'dark' | 'image';
  hideOnMobile?: boolean;
  customClassName?: string;
}

// --- Specific Block Data Interfaces ---
// Add more specific block types here as needed

export interface RichTextBlockData extends BaseBlockSettings {
  type: 'rich-text';
  content: string; // HTML or JSON from TipTap
}

export interface ImageBlockData extends BaseBlockSettings {
  type: 'image';
  assetId?: string;
  url?: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
  objectFit?: 'cover' | 'contain';
  aspectRatio?: 'video' | 'square' | 'portrait' | 'auto';
  linkUrl?: string;
}

export interface VideoBlockData extends BaseBlockSettings {
  type: 'video';
  assetId?: string;
  url?: string;
  title?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
}

export interface FormBlockData extends BaseBlockSettings {
  type: 'form';
  collectionId: string;
  submitLabel?: string;
  successMessage?: string;
}

export interface HeroBlockData extends BaseBlockSettings {
  type: 'hero';
  headline: string;
  subheadline?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryUrl?: string;
  backgroundImage?: string;
  overlay?: boolean;
  minHeight?: 'sm' | 'md' | 'lg' | 'screen';
  textColor?: 'light' | 'dark';
}

export interface ColumnsBlockData extends BaseBlockSettings {
  type: 'columns';
  columns?: 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  items: Array<{
    id: string;
    icon?: string;
    title: string;
    body?: string;
  }>;
}

export interface SpacerBlockData extends BaseBlockSettings {
  type: 'spacer';
  height: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export interface CtaBlockData extends BaseBlockSettings {
  type: 'cta';
  headline: string;
  body?: string;
  primaryLabel: string;
  primaryUrl: string;
  secondaryLabel?: string;
  secondaryUrl?: string;
}

export interface CollectionListBlockData extends BaseBlockSettings {
  type: 'collection-list';
  collectionId?: string;
  /** Field keys to show on each card */
  displayFields?: string[];
  /** Grid layout variant */
  layout?: 'list' | 'grid-2' | 'grid-3' | 'grid-4';
  /** Maximum number of items to fetch */
  limit?: number;
  /** Field key whose value is an image URL */
  imageField?: string;
  /** Field key to use as the card heading */
  titleField?: string;
}

// --- Canonical Block Union ---
export type BlockData =
  | RichTextBlockData
  | ImageBlockData
  | VideoBlockData
  | FormBlockData
  | HeroBlockData
  | ColumnsBlockData
  | SpacerBlockData
  | CtaBlockData
  | CollectionListBlockData
  | (BaseBlockSettings & { type: string; [key: string]: any }); // Fallback for extensibility

// --- Block Wrapper in Page ---
export interface Block {
  id: string;
  type: BlockData['type'];
  data: BlockData;
  order: number;
}

// --- Page Data ---
export interface PageMeta {
  title?: string;
  description?: string;
  ogImage?: string;
  /** Explicit canonical URL override. Defaults to NEXT_PUBLIC_APP_URL/slug. */
  canonical?: string;
  /** Set to true to tell search engines not to index this page. */
  noIndex?: boolean;
}

export interface PageData {
  id: string;
  slug: string;
  title: string;
  blocks: {
    en: Block[];
    ar?: Block[]; // Optional, fallback to en or empty
  };
  meta: PageMeta;
  status: 'draft' | 'published';
  schemaVersion: number; // For future migrations
  publishedAt?: string | null;
  updatedAt?: string;
}
