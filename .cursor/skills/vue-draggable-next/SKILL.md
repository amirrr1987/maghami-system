---
name: vue-draggable-next
description: >
  Type-safe vue-draggable-next (SortableJS) in apps/web — list reorder and
  multi-list drag. Use when implementing file manager sort/move or sortable UIs.
  Not for pixel positioning (useDraggable).
---

# vue-draggable-next (SortableJS)

Docs: [npm vue-draggable-next](https://www.npmjs.com/package/vue-draggable-next) · built on [SortableJS](https://sortablejs.github.io/Sortable/).

Installed: `vue-draggable-next@^2.3.0` + peer `sortablejs@^1.15`.

## When to use

| Need | Library |
|---|---|
| Reorder list / move between lists | **vue-draggable-next** |
| Float a panel by x/y pixels | VueUse `useDraggable` (wrong for file managers) |

## Import

```ts
import { VueDraggableNext } from 'vue-draggable-next'
```

## Correct pattern (v-for default slot)

`vue-draggable-next` v2 often renders **nothing** with `#item` + `item-key` (vuedraggable-v3 API). Prefer **default slot + `v-for`**:

```vue
<script setup lang="ts">
import { VueDraggableNext as Draggable } from 'vue-draggable-next'
import type { StoredFile } from '@maghami-system/schemas'
import { ref } from 'vue'

const items = ref<StoredFile[]>([])

function onEnd(): void {
  void persistOrder(items.value.map((row) => row.id))
}
</script>

<template>
  <Draggable
    v-model="items"
    tag="div"
    class="grid"
    :animation="150"
    :disabled="false"
    @end="onEnd"
  >
    <div v-for="element in items" :key="element.id" class="card">
      {{ element.originalName }}
    </div>
  </Draggable>
</template>
```

Type list items from domain schemas (`StoredFile`), not hand-rolled duplicates.

## Anti-patterns

- **`#item` + `item-key`** — can show empty UI while `items.length` is correct (seen in FilesView)
- Using `@vueuse/core` `useDraggable` for sortable file/folder UX
- Inventing parallel prop interfaces — pass Sortable options as component props
- Changing on-disk file names on “move to folder” — folders are DB metadata only in this app
