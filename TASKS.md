# TASKS.md

## Quick wins — isolated CSS fixes

[x] 1. Page builder output has no spacing/padding
        Symptom: builder-rendered pages have no top padding 
        below the nav, no horizontal container margins — 
        content sits flush against the edges
        Compare: existing hardcoded pages have proper 
        padding and max-width container
        Likely cause: the (site) route that renders 
        page builder output is missing a wrapper with 
        padding/max-width, or the blocks render without 
        a container — NOT a TipTap issue
        Scope: 
        - src/app/(site)/ — find the page renderer route
        - Compare its wrapper classes to an existing 
          hardcoded page like "recherche et developpement"
        - Match the spacing, do not change block logic
        CSS only. No logic changes.
```

---


[x] 2. Pages list — static pages and templates mixed together
        Symptom: user can't distinguish page types in the list
        Scope: the pages list component in (dashboard)
        Add visual grouping or a type badge/filter
        No backend changes needed.
        Done: split flat list into "Pages" / "Templates" sections in
        (dashboard)/dashboard/pages/page.tsx; badge now shows INDEX or DETAIL.

## Architecture — state management for template builder

[x] 3. Binding state needs to be lifted out of local state
        Symptom: when a user selects a block and opens the
        inspector to bind a field, that state can't be shared
        between the canvas and inspector with local useState
        Solution: introduce a small Zustand store ONLY for
        the template builder (not the static builder)
        Scope: new file lib/store/templateBuilderStore.ts
        Contains: selectedBlockId, collectionId, bindings map
        Do not touch the static page builder state.
        Done: created src/lib/store/templateBuilderStore.ts with
        selectedBlockId, collectionId, bindings, and actions
        setSelectedBlock, setCollection (implicit clearBindings on
        collection change), setBinding, removeBinding, clearBindings;
        installed zustand.

## Core feature — bindable components

[x] 4. Replace "Collection Item Fields" auto-block
        with individual bindable components
        Current: one block that dumps all fields automatically
        Target: separate blocks — BoundText, BoundImage,
        BoundRichText, BoundDate — each with a field selector
        in the inspector
        Scope:
        - components/page-builder/blocks/bound/ (new folder)
        - Each block has a `fieldKey` prop
        - Inspector shows dropdown of available fields
          from the current collection schema (from Drizzle)
        Do tasks 3 first, this depends on the store.
        Done: created blocks/bound/{BoundText,BoundImage,BoundRichText,BoundDate}Block.tsx;
        added FieldType/CollectionField/BoundBlockData types; inspector fetches collection
        fields from store's collectionId and shows type-filtered dropdown in template mode;
        collection-item-fields removed from registry.

[x] 5. Container/Card block with child slots
        Symptom: no way to nest components or build a card
        Scope: new ContainerBlock that accepts children blocks
        Inspector controls: direction (row/col), gap,
        padding, border, border-radius, background
        Children can be any block including bound blocks
        Depends on task 4.
        Done: ContainerBlock outside registry to avoid circular imports; EditorContext provides
        selectedBlockId to nested children; recursive updateBlock/removeBlock/duplicateBlock/findBlock
        in Editor.tsx; nested SortableContext shares outer DndContext; ContainerPreview uses inline CSS.

[x] 6. Extended inspector for template mode only
        Current inspector: padding, max-width, alignment, bg
        Template inspector needs: typography controls,
        border, gap, grid columns, aspect ratio
        Scope: extend InspectorPanel with a mode prop
        mode="static" shows current controls
        mode="template" shows extended controls
        No changes to static page inspector behaviour.
        Done: added mode prop to Inspector/BlockInspectorPanel; template mode appends Typography,
        Border, Grid/Flex, and Media sections; 8 new fields added to BaseBlockSettings in types.ts.

## Routing & structure

[x] 7. Verify and document collection template routing
        Routes needed:
        /collection/[name] — index template
        /collection/[name]/[slug] — detail template
        Scope: app/(site)/collection/ folder
        Check routes exist, slugs generate on collection
        creation, 404 handled gracefully.
        Done: routes exist under /collections/[slug] and /collections/[slug]/[itemId];
        detail links now use entry.slug ?? entry.id; detail page resolves by slug first, falls back to id.

[x] 8. Index template — repeater block
        The collection index page needs a block that 
        renders one card per collection item
        Scope: new RepeaterBlock in template builder only
        User picks collection, picks card layout (from 
        saved container blocks), renders list
        Depends on tasks 5 and 7.
```Add these two tasks to TASKS.md:

[ x] 9. Inspector shows nothing when a bound block is 
        selected in the template editor
        Symptom: select BoundRichText (or any bound block), 
        open inspector — field binding dropdown does not appear
        Likely cause: Inspector is not receiving mode="template" 
        from the template editor page, so FieldBindingSection 
        never renders
        Scope: find where Inspector is rendered inside the 
        template editor and check the mode prop

[x ] 10. Repeater block — collection selection resets to none
         and preview shows placeholder instead of real data
         Symptom: pick a collection in the Repeater inspector, 
         it switches back to "none"; preview never renders entries
         Likely cause: RepeaterBlockData changes not being 
         persisted back through updateBlock, or collectionId 
         not saved to the block data correctly
         Scope: RepeaterBlock.tsx inspector onChange handler 
         and renderPreview.tsx repeater case

         Add to TASKS.md:

[ x] 11. Publish fails with 400 after adding CSS styles 
        to a template page block
        Symptom: /api/pages/publish returns 400 Bad Request
        /api/pages/save-draft also returns 400
        Likely cause: the publish/save-draft API route 
        validates the blocks payload and rejects unknown 
        fields — the new style fields from Task 6 
        (fontSize, fontWeight, textColor, borderWidth, 
        borderRadius, gap, gridColumns, aspectRatio) 
        are not in the validation schema
        Scope: src/app/api/pages/publish/route.ts and
        src/app/api/pages/save-draft/route.ts

Add to TASKS.md:

[x ] 12. Inspector does not restore saved block settings 
        on reopen
        Symptom: change background to brand-red, save, 
        close and reopen the editor — inspector shows 
        "None" instead of brand-red
        Likely cause: Inspector controlled inputs are not 
        reading their initial values from the block data — 
        they use local state initialised to a default 
        instead of reading from selectedBlock.data

[ ] 13. Typography controls in template inspector 
        have no visible effect on the rendered block
        Symptom: change fontSize or fontWeight in inspector,
        block appearance does not change in editor or preview
        Likely cause: block components do not read 
        fontSize/fontWeight/textColor from their data — 
        the inspector writes the values but nothing consumes them


---

## Do you need skills for this?

Yes, three specific ones:

**`skill: tiptap-styling.md`**
Short skill. Tells Claude that TipTap output lives in a specific wrapper, that prose styles come from `@tailwindcss/typography`, and that changes must be consistent between dashboard and site layout. Prevents Claude from adding inline styles or Tailwind classes directly to TipTap components.

**`skill: bound-block.md`**
The most important one. Defines the pattern every bound block must follow — it receives a `fieldKey` prop, reads available fields from the template builder Zustand store, and renders a placeholder in the editor but real data at render time. Every bound block (BoundText, BoundImage, etc.) must follow this exact same pattern so they're consistent.

**`skill: template-builder.md`**
High-level rules for the template builder specifically. Never touch static page builder files. Always use the Zustand store for binding state. Inspector in template mode always shows the extended controls. Renderer reads bindings and resolves them against the Drizzle schema at request time.

---

## Suggested order, honest about dependencies
```
Task 1  → no dependencies, do this first, 30min max
Task 2  → no dependencies, purely visual
Task 7  → verify routing exists before building on top of it
Task 3  → Zustand store, foundational for everything below
Task 4  → depends on 3
Task 6  → depends on 3, parallel with 4
Task 5  → depends on 4
Task 8  → depends on 5 and 7, do this last