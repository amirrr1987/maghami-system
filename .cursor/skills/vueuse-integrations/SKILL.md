---
name: vueuse-integrations
description: >
  Type-safe @vueuse/integrations v14 in apps/web — useNProgress, useSortable
  subpath exports. Use when wrapping nprogress or SortableJS in Vue composables.
---

# @vueuse/integrations (type-safe)

Docs: [vueuse.org/integrations](https://vueuse.org/integrations/useNProgress/).  
Version: `@vueuse/integrations` **14.4.0**. Peers present here: `nprogress`, `sortablejs` (and `async-validator` via antdv).

## Source of truth

**Subpath imports** (see package `exports`). Do not import unused wrappers (`useAxios`, `useFuse`, …) unless that peer is a direct dependency.

```ts
import { useNProgress } from '@vueuse/integrations/useNProgress'
import type {
  UseNProgressOptions,
  UseNProgressReturn,
} from '@vueuse/integrations/useNProgress'

import { useSortable } from '@vueuse/integrations/useSortable'
import type {
  UseSortableOptions,
  UseSortableReturn,
} from '@vueuse/integrations/useSortable'
```

Root `from '@vueuse/integrations'` also re-exports these names; prefer subpaths for tree-shaking.

## useNProgress

```ts
type UseNProgressOptions = Partial<NProgressOptions> // from 'nprogress'

interface UseNProgressReturn {
  isLoading: WritableComputedRef<boolean, boolean>
  progress: Ref<number | null | undefined>
  start: () => NProgress
  done: (force?: boolean) => NProgress
  remove: () => void
}

declare function useNProgress(
  currentProgress?: MaybeRefOrGetter<number | null | undefined>,
  options?: UseNProgressOptions,
): UseNProgressReturn
```

Also import `nprogress/nprogress.css`. Types for `NProgress` / `NProgressOptions`: **`nprogress`** (`@types/nprogress`).

## useSortable

```ts
interface UseSortableOptions extends Options, ConfigurableDocument {
  watchElement?: boolean // default false
}

interface UseSortableReturn {
  start: () => void
  stop: () => void
  option: (<K extends keyof Sortable.Options>(name: K, value: Sortable.Options[K]) => void) &
    (<K extends keyof Sortable.Options>(name: K) => Sortable.Options[K])
}

declare function useSortable<T>(
  el: MaybeRefOrGetter<MaybeElement> | string,
  list: MaybeRef<T[]>,
  options?: UseSortableOptions,
): UseSortableReturn
```

Also exported: `insertNodeAt`, `removeNode`, `moveArrayElement`.

For Vue **lists in templates**, prefer **`vue-draggable-next`** (`VueDraggableNextProps`) over `useSortable`.

## Anti-patterns

- Inventing `UseNProgressOptions` / `SortableOptions` locally
- `any` on `option()` / `done()`
- Calling `useAxios` / `useJwt` without those peers installed
- Using `useSortable` and `VueDraggableNext` on the same DOM node
