---
name: template-builder
description: Use when working on anything inside the 
collection template builder — routing, inspector, 
container blocks, repeater, or binding system.
---

# Template Builder Rules

## Separation from static builder
- Static builder: src/components/page-builder/
- Template builder additions: clearly separated, 
  do not modify existing static builder files

## State
- Template builder state lives in:
  src/lib/store/templateBuilderStore.ts (Zustand)
- Store contains: selectedBlockId, collectionId, 
  bindings map (blockId → fieldKey)
- Static builder keeps its local useState — do not change it

## Routes
- /collection/[name]        → index template
- /collection/[name]/[slug] → detail template
- Both routes live in src/app/(site)/collection/

## Inspector modes
- mode="static"   → current controls only
- mode="template" → extended controls (typography, 
  border, gap, grid, aspect-ratio)

## Rendering
- At render time, read bindings from DB
- Resolve field values from collection item
- Output semantic HTML, no Tailwind in rendered output

## Do not
- Touch schema.ts without being asked
- Mix template inspector with static inspector
- Add binding logic to static page blocks