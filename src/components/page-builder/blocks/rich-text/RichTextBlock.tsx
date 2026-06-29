'use client';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { type BlockData } from '@/types';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { PROSE_CLASSES } from '../proseClasses';
import {
  Bold, Italic, Strikethrough, Code, Link as LinkIcon,
  List, ListOrdered, Quote, Minus, Undo, Redo,
  Heading1, Heading2, Heading3,
} from 'lucide-react';

// ── Toolbar ────────────────────────────────────────────────────────────────

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={cn(
        'p-1.5 rounded text-sm transition-colors',
        active
          ? 'bg-foreground text-background'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL', previous ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap gap-0.5 border-b pb-1.5 mb-1.5">
      {/* History */}
      <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()}>
        <Undo className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()}>
        <Redo className="h-3.5 w-3.5" />
      </ToolbarButton>

      <div className="w-px bg-border mx-1 self-stretch" />

      {/* Headings */}
      <ToolbarButton
        title="Heading 1"
        active={editor.isActive('heading', { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        title="Heading 2"
        active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        title="Heading 3"
        active={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="h-3.5 w-3.5" />
      </ToolbarButton>

      <div className="w-px bg-border mx-1 self-stretch" />

      {/* Inline marks */}
      <ToolbarButton
        title="Bold"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        title="Italic"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        title="Strikethrough"
        active={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        title="Inline Code"
        active={editor.isActive('code')}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <Code className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        title="Link"
        active={editor.isActive('link')}
        onClick={setLink}
      >
        <LinkIcon className="h-3.5 w-3.5" />
      </ToolbarButton>

      <div className="w-px bg-border mx-1 self-stretch" />

      {/* Lists */}
      <ToolbarButton
        title="Bullet List"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        title="Numbered List"
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-3.5 w-3.5" />
      </ToolbarButton>

      <div className="w-px bg-border mx-1 self-stretch" />

      {/* Block elements */}
      <ToolbarButton
        title="Blockquote"
        active={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        title="Divider"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus className="h-3.5 w-3.5" />
      </ToolbarButton>
    </div>
  );
}

// ── Editor Component ───────────────────────────────────────────────────────

export function RichTextEditor({
  block,
  onChange,
}: {
  block: BlockData & { type: 'rich-text' };
  onChange: (updates: Partial<BlockData>) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: false }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: block.content,
    editorProps: {
      attributes: {
        class: [
          'prose prose-sm max-w-none p-3 min-h-[120px] focus:outline-none',
          'prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-[#0f172a]',
          'prose-a:text-[#BC0D2A] prose-a:underline',
          'prose-strong:text-[#0f172a]',
          'prose-ul:list-disc prose-ol:list-decimal',
        ].join(' '),
      },
    },
    onUpdate: ({ editor }) => {
      onChange({ content: editor.getHTML() });
    },
  });

  return (
    <div className="space-y-1">
      <Label className="text-muted-foreground text-xs uppercase tracking-wider">Rich Text</Label>
      <div className="border rounded-md p-2">
        {editor && <Toolbar editor={editor} />}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

// ── Preview Component ──────────────────────────────────────────────────────

export function RichTextPreview({
  block,
  className,
}: {
  block: BlockData & { type: 'rich-text' };
  className?: string;
}) {
  return (
    <div
      className={cn(PROSE_CLASSES, className)}
      dangerouslySetInnerHTML={{ __html: block.content }}
    />
  );
}
