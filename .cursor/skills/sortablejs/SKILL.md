---
name: sortablejs
description: >
  SortableJS 1.15 in apps/web — no bundled types. Prefer vue-draggable-next
  VueDraggableNextProps or @vueuse/integrations useSortable. Use when reordering
  lists; not for pixel drag (VueUse useDraggable).
---

# sortablejs (no bundled types)

Installed: `sortablejs@^1.15.6` (lockfile **1.15.7**).  
`package.json` has **no** `types` / `.d.ts`. `@types/sortablejs` is **not** in this repo.

## Source of truth in this app

Do **not** `import Sortable from 'sortablejs'` in app code (untyped). Use a typed wrapper:

| UI | Package types |
|---|---|
| Vue list / grid reorder | `VueDraggableNextProps`, `VueDraggableNextEvents`, `SortableEvent`, `DragChangeEvent` from **`vue-draggable-next`** |
| Imperative / ref element | `UseSortableOptions`, `UseSortableReturn` from **`@vueuse/integrations/useSortable`** (`UseSortableOptions extends Options` from `sortablejs`) |

```ts
import { VueDraggableNext } from 'vue-draggable-next'
import type {
  VueDraggableNextProps,
  VueDraggableNextEvents,
  SortableEvent,
  DragChangeEvent,
} from 'vue-draggable-next'
```

```ts
import { useSortable } from '@vueuse/integrations/useSortable'
import type { UseSortableOptions, UseSortableReturn } from '@vueuse/integrations/useSortable'
```

`UseSortableReturn`: `start()`, `stop()`, `option` (`keyof Sortable.Options` getter/setter). Extra field on options: `watchElement?: boolean`.

## If Sortable is used raw

Say so: **no usable types from the package**. Do not invent `interface SortableOptions`. Add `@types/sortablejs` first (`Sortable.Options`, `Sortable.SortableEvent`, `Sortable.create`). Until then, keep using the wrappers above.

## Anti-patterns

- Parallel `interface SortableProps` / `any` on drag events
- VueUse `@vueuse/core` `useDraggable` for file/folder reorder
- Importing `sortablejs` without types in `apps/web/src`
