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
  fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  textColor?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  borderWidth?: '0' | '1' | '2' | '4';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  gap?: 'none' | 'sm' | 'md' | 'lg';
  gridColumns?: '1' | '2' | '3' | '4';
  aspectRatio?: 'auto' | 'square' | 'video' | 'portrait' | '1:1' | '4:3' | '16:9' | '3:4';
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
  height?: number;
  caption?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
  linkUrl?: string;
  /** Sizing preset — 'full' | 'half' | 'third' | 'auto'. Defaults to 'full'. */
  width?: 'full' | 'half' | 'third' | 'auto';
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
  /** Per-field inclusion, order, and optional label override. Order in the
   * array is the display order. Fields not listed default to included with
   * the original collection label. */
  fieldConfig?: Array<{ key: string; included: boolean; label?: string }>;
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
  /** Vertical whitespace size — xs 8px, sm 16px, md 32px, lg 64px, xl 96px. */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** @deprecated Legacy field from the pre-divider Spacer. Read as a fallback for `size`. */
  height?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showDivider?: boolean;
  /** Any CSS color. Defaults to currentColor at 20% opacity. */
  dividerColor?: string;
  dividerStyle?: 'solid' | 'dashed' | 'dotted';
}

export interface TableBlockData extends BaseBlockSettings {
  type: 'table';
  /** Optional heading shown above the table. */
  caption?: string;
  headers: string[];
  /** Each row's length is kept in sync with headers by the editor. */
  rows: string[][];
  /** Alternating row backgrounds. Defaults to true. */
  striped?: boolean;
  /** Visible cell borders. Defaults to true. */
  bordered?: boolean;
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

// --- Composite / Content Blocks ---

export interface ProductHeroBlockData extends BaseBlockSettings {
  type: 'product-hero';
  title?: string;
  subtitle1?: string;
  subtitle2?: string;
  /** Rich-text HTML body paragraph. */
  body?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  image?: string;
  imagePosition?: 'left' | 'right';
  backgroundColor?: string;
  // Per-prop field bindings (detail templates only). Field keys resolve
  // against the current collection entry / repeater context.
  titleFieldKey?: string | null;
  subtitle1FieldKey?: string | null;
  subtitle2FieldKey?: string | null;
  bodyFieldKey?: string | null;
  imageFieldKey?: string | null;
}

export interface SectionHeadingBlockData extends BaseBlockSettings {
  type: 'section-heading';
  heading?: string;
  subheading?: string;
  /** Overrides BaseBlockSettings.align for this block's own text-align. */
  align?: 'left' | 'center' | 'right';
  /** Maps to h4/16 | h3/20 | h2/28. */
  size?: 'sm' | 'md' | 'lg';
  showDivider?: boolean;
  dividerColor?: string;
  headingFieldKey?: string | null;
  subheadingFieldKey?: string | null;
}

export interface KeyValueListBlockData extends BaseBlockSettings {
  type: 'key-value-list';
  heading?: string;
  items: Array<{ id: string; label: string; value: string }>;
  striped?: boolean;
  showDividers?: boolean;
  layout?: 'two-col' | 'stacked';
}

export interface DownloadButtonBlockData extends BaseBlockSettings {
  type: 'download-button';
  label?: string;
  /** File URL (usually an asset from the AssetPicker). */
  url?: string;
  icon?: 'download' | 'external' | 'none';
  variant?: 'primary' | 'outline' | 'ghost';
  /** Overrides BaseBlockSettings.align for the button's flex alignment. */
  align?: 'left' | 'center' | 'right';
  openInNewTab?: boolean;
  urlFieldKey?: string | null;
}

export interface ButtonBlockData extends BaseBlockSettings {
  type: 'button';
  label?: string;
  url?: string;
  variant?: 'primary' | 'outline' | 'ghost';
  icon?: 'none' | 'arrow' | 'external' | 'download';
  /** Overrides BaseBlockSettings.align for the button's flex alignment. */
  align?: 'left' | 'center' | 'right';
  openInNewTab?: boolean;
}

export interface ContactFormSimpleBlockData extends BaseBlockSettings {
  type: 'contact-form-simple';
  heading?: string;
  body?: string;
  imageUrl?: string;
}

export interface CatalogueBlockData extends BaseBlockSettings {
  type: 'catalogue';
  heading?: string;
  ctaLabel?: string;
  imageUrl?: string;
  imageAlt?: string;
}

export interface ContainerBlockData extends BaseBlockSettings {
  type: 'container';
  direction: 'row' | 'column';
  /** Preset layout — overrides direction for multi-column variants. Defaults to 'stack'. */
  layout?: 'stack' | 'two-col-text-image' | 'two-col-image-text' | 'three-col';
  /** How the container collapses below 768px. Defaults to 'stack'. */
  mobileBehavior?: 'stack' | 'same' | 'hide';
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
  /** HTML tag to render the value into. Defaults to 'p'. */
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'span';
}

export interface BoundImageBlockData extends BoundBlockData {
  type: 'bound-image';
  objectFit?: 'cover' | 'contain' | 'fill';
  /** Sizing preset — 'full' | 'half' | 'third' | 'auto'. Defaults to 'full'. */
  width?: 'full' | 'half' | 'third' | 'auto';
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
  | TableBlockData
  | CtaBlockData
  | CollectionListBlockData
  | NewsletterBlockData
  | ContactFormBlockData
  | ContactFormSimpleBlockData
  | CollectionItemFieldsBlockData
  | ProductHeroBlockData
  | SectionHeadingBlockData
  | KeyValueListBlockData
  | DownloadButtonBlockData
  | ButtonBlockData
  | CatalogueBlockData
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
    fr?: Block[]; // Optional, fallback to en or empty
  };
  meta: PageMeta;
  status: 'draft' | 'published';
  schemaVersion: number; // For future migrations
  publishedAt?: string | null;
  updatedAt?: string;
}
