---
name: tiptap-styling
description: Use when fixing or modifying TipTap rich text 
styling, prose CSS, or any mismatch between editor output 
and published page appearance.
---

# TipTap Styling Rules

## Where TipTap output is rendered
- In the editor: inside page-builder block components
- On the site: inside (site) layout — this is where 
  styling mismatches usually happen

## How to fix styling
- Use @tailwindcss/typography prose classes on the wrapper
- The same prose classes must be applied in BOTH 
  the dashboard editor and the (site) renderer
- Never add inline styles to TipTap components
- Never add Tailwind classes inside the TipTap editor 
  component itself — style the wrapper div

## Pattern to follow
\`\`\`tsx
// Correct — style the wrapper
<div className="prose prose-lg max-w-none">
  <EditorContent editor={editor} />
</div>

// Wrong — never do this
<EditorContent editor={editor} className="text-lg" />
\`\`\`

## Scope
Only touch files related to TipTap rendering.
Do not modify block logic, drag-and-drop, or state.