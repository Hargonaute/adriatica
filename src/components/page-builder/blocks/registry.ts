import { type BlockData } from '@/types';
import { FileText, Image as ImageIcon, Video, FormInput, Sparkles, LayoutGrid, Minus, MousePointerClick, Library, Mail, PhoneCall, Type, CalendarDays, AlignLeft, ListTree } from 'lucide-react';
import React from 'react';

import { RichTextEditor, RichTextPreview } from './rich-text/RichTextBlock';
import { ImageEditor, ImagePreview } from './image/ImageBlock';
import { VideoEditor, VideoPreview } from './video/VideoBlock';
import { FormEditor, FormPreview } from './form/FormBlock';
import { HeroEditor, HeroPreview } from './hero/HeroBlock';
import { ColumnsEditor, ColumnsPreview } from './columns/ColumnsBlock';
import { SpacerEditor, SpacerPreview } from './spacer/SpacerBlock';
import { CtaEditor, CtaPreview } from './cta/CtaBlock';
import { CollectionListEditor, CollectionListPreview } from './collection-list/CollectionListBlock';
import { NewsletterEditor, NewsletterPreview } from './newsletter/NewsletterBlock';
import { ContactFormEditor, ContactFormPreview } from './contact-form/ContactFormBlock';
import { BoundTextEditor, BoundTextPreview } from './bound/BoundTextBlock';
import { BoundImageEditor, BoundImagePreview } from './bound/BoundImageBlock';
import { BoundRichTextEditor, BoundRichTextPreview } from './bound/BoundRichTextBlock';
import { BoundDateEditor, BoundDatePreview } from './bound/BoundDateBlock';
import { CollectionItemFieldsEditor, CollectionItemFieldsPreview } from './collection-item-fields/CollectionItemFieldsBlock';

export type BlockConfig<T extends BlockData = BlockData> = {
  type: T['type'];
  label: string;
  description: string;
  icon: React.ElementType;
  createDefault: () => Omit<T, 'id' | 'type'> & Partial<Pick<T, 'type'>>;
  Editor: React.ComponentType<{ block: T; onChange: (updates: Partial<T>) => void }>;
  Preview: React.ComponentType<{ block: T; className?: string }>;
  validate?: (data: unknown) => { success: boolean; error?: string };
};

export const BLOCKS_REGISTRY: Record<string, BlockConfig<any>> = {
  'hero': {
    type: 'hero',
    label: 'Hero',
    description: 'Full-width hero with headline, CTAs, and image — identical to the live home page',
    icon: Sparkles,
    createDefault: () => ({
      // Empty strings mean "fall back to HeroSection's built-in defaults", so a
      // freshly dropped block renders the exact home-page hero out of the box.
      headline: '',
      subheadline: '',
      ctaLabel: '',
      ctaUrl: '',
      ctaSecondaryLabel: '',
      ctaSecondaryUrl: '',
      backgroundImage: '',
      overlay: false,
      minHeight: 'md',
      textColor: 'light',
      // The real <HeroSection> handles its own pt-24 pb-16, so suppress the
      // outer section padding to avoid doubling.
      paddingTop: 'none',
      paddingBottom: 'none',
    }),
    Editor: HeroEditor,
    Preview: HeroPreview,
  },
  'rich-text': {
    type: 'rich-text',
    label: 'Rich Text',
    description: 'Formatted text with headings, lists, links',
    icon: FileText,
    createDefault: () => ({
      content: '<p>Start typing your content here...</p>',
    }),
    Editor: RichTextEditor,
    Preview: RichTextPreview,
  },
  'image': {
    type: 'image',
    label: 'Image',
    description: 'Single image with alt text and optional caption',
    icon: ImageIcon,
    createDefault: () => ({
      url: '',
      alt: '',
      caption: '',
      objectFit: 'cover',
      linkUrl: '',
    }),
    Editor: ImageEditor,
    Preview: ImagePreview,
  },
  'video': {
    type: 'video',
    label: 'Video',
    description: 'YouTube, Vimeo, or direct MP4 video',
    icon: Video,
    createDefault: () => ({
      url: '',
      title: '',
      autoPlay: false,
      muted: false,
      loop: false,
    }),
    Editor: VideoEditor,
    Preview: VideoPreview,
  },
  'columns': {
    type: 'columns',
    label: 'Columns',
    description: 'Feature grid with icon, title, and body text',
    icon: LayoutGrid,
    createDefault: () => ({
      columns: 3,
      gap: 'md',
      items: [
        { id: crypto.randomUUID(), icon: '🚀', title: 'Fast', body: 'Lightning-fast performance out of the box.' },
        { id: crypto.randomUUID(), icon: '🔒', title: 'Secure', body: 'Enterprise-grade security you can trust.' },
        { id: crypto.randomUUID(), icon: '🎨', title: 'Beautiful', body: 'Stunning design that converts visitors.' },
      ],
    }),
    Editor: ColumnsEditor,
    Preview: ColumnsPreview,
  },
  'cta': {
    type: 'cta',
    label: 'Call to Action',
    description: 'Headline with primary and secondary buttons',
    icon: MousePointerClick,
    createDefault: () => ({
      headline: 'Ready to get started?',
      body: 'Join thousands of teams already using our platform.',
      primaryLabel: 'Get Started Free',
      primaryUrl: '#',
      secondaryLabel: 'Talk to Sales',
      secondaryUrl: '#contact',
    }),
    Editor: CtaEditor,
    Preview: CtaPreview,
  },
  'form': {
    type: 'form',
    label: 'Form',
    description: 'Contact or lead form linked to a collection',
    icon: FormInput,
    createDefault: () => ({
      collectionId: '',
      submitLabel: 'Submit',
      successMessage: "Thank you! We'll be in touch.",
    }),
    Editor: FormEditor,
    Preview: FormPreview,
  },
  'spacer': {
    type: 'spacer',
    label: 'Spacer',
    description: 'Explicit vertical whitespace between blocks',
    icon: Minus,
    createDefault: () => ({
      height: 'md',
    }),
    Editor: SpacerEditor,
    Preview: SpacerPreview,
  },
  'collection-list': {
    type: 'collection-list',
    label: 'Collection List',
    description: 'Display items from any CMS collection as a grid or list',
    icon: Library,
    createDefault: () => ({
      collectionId: '',
      displayFields: [],
      layout: 'grid-3',
      limit: 12,
      imageField: '',
      titleField: '',
    }),
    Editor: CollectionListEditor,
    Preview: CollectionListPreview,
  },
  'newsletter': {
    type: 'newsletter',
    label: 'Newsletter',
    description: 'Email subscription section with image and brand colour',
    icon: Mail,
    createDefault: () => ({
      heading: 'Newsletter',
      body: 'Restez informé sur les dernières nouveautés de Maghreb Adriatica!',
      buttonLabel: "S'inscrire",
      imageUrl: '',
      sectionBg: 'brand-red',
      paddingTop: 'none',
      paddingBottom: 'none',
    }),
    Editor: NewsletterEditor,
    Preview: NewsletterPreview,
  },
  'contact-form': {
    type: 'contact-form',
    label: 'Contact Form',
    description: 'Full contact section with form and side image',
    icon: PhoneCall,
    createDefault: () => ({
      heading: 'Nous contacter',
      body: 'Notre équipe serait ravie de vous entendre.',
      imageUrl: '',
      paddingTop: 'none',
      paddingBottom: 'none',
    }),
    Editor: ContactFormEditor,
    Preview: ContactFormPreview,
  },
  'bound-text': {
    type: 'bound-text',
    label: 'Bound Text',
    description: 'Displays a text, number, email, or textarea field from the current item',
    icon: Type,
    createDefault: () => ({ fieldKey: null }),
    Editor: BoundTextEditor,
    Preview: BoundTextPreview,
  },
  'bound-image': {
    type: 'bound-image',
    label: 'Bound Image',
    description: 'Displays an image field from the current item',
    icon: ImageIcon,
    createDefault: () => ({ fieldKey: null }),
    Editor: BoundImageEditor,
    Preview: BoundImagePreview,
  },
  'bound-rich-text': {
    type: 'bound-rich-text',
    label: 'Bound Rich Text',
    description: 'Renders a rich-text field from the current item as formatted HTML',
    icon: AlignLeft,
    createDefault: () => ({ fieldKey: null }),
    Editor: BoundRichTextEditor,
    Preview: BoundRichTextPreview,
  },
  'bound-date': {
    type: 'bound-date',
    label: 'Bound Date',
    description: 'Displays a date field from the current item',
    icon: CalendarDays,
    createDefault: () => ({ fieldKey: null }),
    Editor: BoundDateEditor,
    Preview: BoundDatePreview,
  },
  'collection-item-fields': {
    type: 'collection-item-fields',
    label: 'Collection Item Fields',
    description: "Renders all of the current item's field values in one block",
    icon: ListTree,
    createDefault: () => ({ hiddenFields: [] }),
    Editor: CollectionItemFieldsEditor,
    Preview: CollectionItemFieldsPreview,
  },
};

export type BlockType = keyof typeof BLOCKS_REGISTRY;
