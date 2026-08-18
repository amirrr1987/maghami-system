---
name: vue-draggable-next
description: >
  Type-safe vue-draggable-next v2 in apps/web — VueDraggableNextProps,
  VueDraggableNextEvents, DragChangeEvent, SortableEvent. Use for list reorder
  / multi-list drag. Not VueUse useDraggable.
---

# vue-draggable-next (type-safe)

Docs: [npm vue-draggable-next](https://www.npmjs.com/package/vue-draggable-next).  
Installed: `vue-draggable-next@2.3.0` (peer `sortablejs@^1.14`). Types: `dist/vue-draggable-next.d.ts`.

## Source of truth

```ts
import { VueDraggableNext } from 'vue-draggable-next'
import type {
  VueDraggableNextProps,
  VueDraggableNextEvents,
  VueDraggableNextSlots,
  DragChangeEvent,
  SortableEvent,
  MoveEvent,
  Group,
  GroupSpec,
} from 'vue-draggable-next'
```

Do not invent parallel prop/event types. `DraggableItem` in the package is `{ [key: string]: any }` — prefer domain types (`StoredFile`) as `T`.

## VueDraggableNextProps\<T\>

```ts
interface VueDraggableNextProps<T = DraggableItem> {
  modelValue?: T[]
  list?: T[]
  itemKey?: string | ((item: T) => string | number)
  tag?: string
  component?: string | Component
  componentData?: ComponentData
  group?: Group // GroupName | GroupSpec
  sort?: boolean
  delay?: number
  delayOnTouchStart?: boolean
  touchStartThreshold?: number
  disabled?: boolean
  animation?: number
  easing?: EasingFunction
  ghostClass?: string
  chosenClass?: string
  dragClass?: string
  handle?: string
  filter?: string
  preventOnFilter?: boolean
  draggable?: string
  dataIdAttr?: string
  swapThreshold?: number
  invertSwap?: boolean
  invertedSwapThreshold?: number
  direction?: 'horizontal' | 'vertical' | 'auto'
  scroll?: boolean | HTMLElement
  scrollSensitivity?: number
  scrollSpeed?: number
  bubbleScroll?: boolean
  forceFallback?: boolean
  fallbackClass?: string
  fallbackOnBody?: boolean
  fallbackTolerance?: number
  multiDrag?: boolean
  selectedClass?: string
  multiDragKey?: string
  clone?: (original: T) => T
  move?: (event: MoveEvent<T>, originalEvent: Event) => boolean | void
  removeOnSpill?: boolean
  onSpill?: (event: SortableEvent) => void
}
```

`VueDraggableNextEvents<T>`: `'update:modelValue'`, `change` (`DragChangeEvent<T>`), `start`/`end`/`add`/`remove`/`update`/`sort`/`choose`/`unchoose`/`filter`/`clone` (`SortableEvent`), `move` (`MoveEvent<T>`).

`DragChangeEvent<T>`: `added?` / `removed?` / `moved?` with indexes + `element: T`.

## Pattern (default slot + v-for)

The `DefineComponent` prop types only declare `modelValue` | `list` | `tag` | `clone` | `move` | `component` | `componentData` | `options` | `noTransitionOnDrag`. Extra Sortable fields from `VueDraggableNextProps` are still the documented API — pass them as attrs. Prefer **default slot + `v-for`** (v2 `#item` + `item-key` can render empty).

```vue
<script setup lang="ts">
import { VueDraggableNext as Draggable } from 'vue-draggable-next'
import type { StoredFile } from '@maghami-system/schemas'
import type { SortableEvent } from 'vue-draggable-next'
import { ref } from 'vue'

const items = ref<StoredFile[]>([])

function onEnd(_event: SortableEvent): void {
  void persistOrder(items.value.map((row) => row.id))
}
</script>

<template>
  <Draggable v-model="items" tag="div" :animation="150" @end="onEnd">
    <div v-for="element in items" :key="element.id">
      {{ element.originalName }}
    </div>
  </Draggable>
</template>
```

## Anti-patterns

- `#item` + `item-key` (empty UI while `items.length` is correct)
- `@vueuse/core` `useDraggable` for sortable lists
- Hand-rolled prop interfaces / `any` on `change` / `end`
- Importing untyped `sortablejs` instead of these events
