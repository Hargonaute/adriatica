import { type LucideIcon } from 'lucide-react';

// --- Field Types (Template Builder) ---
export type FieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'date'
  | 'textarea'
  | 'checkbox'
  | 'rich-text'
  | 'image';

export interface CollectionField {
  id: string;
  key: string;
  label: string;
  type: FieldType;
}

// --- Base Block Settings (Shared) ---
export interface BaseBlockSettings {
  paddingTop?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  paddingBottom?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'left' | 'center' | 'right';
  maxWidth?: 'sm' | 'md' | 'lg' | 'full';
  background?: 'none' | 'muted' | 'dark' | 'image' | 'brand-red' | 'brand-green' | 'navy';
  hideOnMobile?: boolean;
  customClassName?: string;
  // Template-mode styling extensions
  fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  textColor?: string;
  borderWidth?: '0' | '1' | '2' | '4';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  gap?: 'none' | 'sm' | 'md' | 'lg';
  gridColumns?: '1' | '2' | '3' | '4';
  aspectRatio?: 'auto' | 'square' | 'video' | 'portrait';
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
  /** Slug of the selected collection (used for public item links) */
  collectionSlug?: string;
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
  /** When true, each card links to /collections/{slug}/{itemId} */
  linkToItems?: boolean;
}

export interface NewsletterBlockData extends BaseBlockSettings {
  type: 'newsletter';
  heading?: string;
  body?: string;
  buttonLabel?: string;
  imageUrl?: string;
  /** Outer section background colour */
  sectionBg?: 'brand-red' | 'brand-green' | 'navy' | 'gray';
}

export interface ContactFormBlockData extends BaseBlockSettings {
  type: 'contact-form';
  heading?: string;
  body?: string;
  imageUrl?: string;
}

export interface CollectionItemFieldsBlockData extends BaseBlockSettings {
  type: 'collection-item-fields';
  /** Field keys to suppress from the rendered output */
  hiddenFields?: string[];
}

export interface ContainerBlockData extends BaseBlockSettings {
  type: 'container';
  direction: 'row' | 'column';
  containerGap?: 'none' | 'sm' | 'md' | 'lg';
  containerPadding?: 'none' | 'sm' | 'md' | 'lg';
  backgroundColor?: string;
  borderColor?: string;
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  children: Block[]; // TypeScript resolves this mutual recursion correctly
}

export interface RepeaterBlockData extends BaseBlockSettings {
  type: 'repeater';
  /** UUID of the collection whose entries are repeated. */
  collectionId?: string;
  /** Slug of the collection (used for /collections/{slug}/{itemId} links). */
  collectionSlug?: string;
  /** Number of grid columns at full width. */
  columns?: '1' | '2' | '3' | '4';
  /** Gap between cards. */
  repeaterGap?: 'sm' | 'md' | 'lg';
  /** The card layout the user designs — rendered once per entry at display time. */
  cardTemplate: Block[];
}

// --- Bound Blocks (Template Builder) ---
export interface BoundBlockData extends BaseBlockSettings {
  fieldKey: string | null;
}

export interface BoundTextBlockData extends BoundBlockData {
  type: 'bound-text';
}

export interface BoundImageBlockData extends BoundBlockData {
  type: 'bound-image';
}

export interface BoundRichTextBlockData extends BoundBlockData {
  type: 'bound-rich-text';
}

export interface BoundDateBlockData extends BoundBlockData {
  type: 'bound-date';
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
  | NewsletterBlockData
  | ContactFormBlockData
  | CollectionItemFieldsBlockData
  | ContainerBlockData
  | RepeaterBlockData
  | BoundTextBlockData
  | BoundImageBlockData
  | BoundRichTextBlockData
  | BoundDateBlockData
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
