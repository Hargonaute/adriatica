/**
 * Shared prose class chain for the public renderer. Used by RichTextPreview,
 * BoundRichTextPreview, and CollectionItemFieldsPreview so that any HTML
 * content rendered through the @tailwindcss/typography plugin gets the same
 * typography scale, weights, and color tokens regardless of which block it
 * lives in.
 *
 * Scale (matches Inspector spec):
 *   h1 → text-5xl font-bold     h2 → text-4xl font-semibold
 *   h3 → text-2xl font-semibold p  → text-base text-muted-foreground
 *
 * Brand link color `#BC0D2A` stays as a literal — no shadcn token maps to it.
 */
export const PROSE_CLASSES = [
  'prose prose-slate max-w-none',
  'prose-headings:font-[family-name:var(--font-inter)] prose-headings:tracking-tight prose-headings:text-foreground',
  'prose-h1:text-5xl prose-h1:font-bold',
  'prose-h2:text-4xl prose-h2:font-semibold',
  'prose-h3:text-2xl prose-h3:font-semibold',
  'prose-p:text-muted-foreground prose-p:text-base prose-p:leading-relaxed',
  'prose-a:text-[#BC0D2A] prose-a:no-underline hover:prose-a:underline',
  'prose-strong:text-foreground',
  'prose-ul:list-disc prose-ol:list-decimal',
  'prose-li:text-muted-foreground',
].join(' ');
