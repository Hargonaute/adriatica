---
name: bound-block
description: Use when creating or modifying any block that 
binds to a collection field (BoundText, BoundImage, 
BoundRichText, BoundDate).
---

# Bound Block Pattern

## Location
All bound blocks live in:
src/components/page-builder/blocks/bound/

## Every bound block must have these props
\`\`\`ts
type BoundBlockProps = {
  fieldKey: string | null     // which collection field
  label?: string              // display label in editor
  collectionId: string | null // which collection
}
\`\`\`

## Behaviour
- In the EDITOR: show a placeholder with the field name
- At RENDER TIME: resolve the actual value from 
  the collection item data
- Field options come from the Zustand template builder store
- Never hardcode field names

## Inspector
Each bound block shows a field selector dropdown 
in the inspector panel. The dropdown reads available 
fields from the current collection schema.

## Do not
- Mix bound block logic with static block logic
- Auto-display all fields — always require explicit binding
- Skip the placeholder in editor mode