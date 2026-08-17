---
name: vueuse-core
description: >
  Type-safe @vueuse/core utilities in apps/web — useLocalStorage / RemovableRef,
  useStorage options. Use when persisting UI prefs, reactive browser APIs, or
  VueUse composables.
---

# @vueuse/core (type-safe)

Docs: [vueuse.org](https://vueuse.org). Version: `@vueuse/core` **^14** in `apps/web`.

## Source of truth

Import composables and types from **`@vueuse/core`** (re-exports shared types such as `RemovableRef`). Do not invent parallel option interfaces or use `any`.

```ts
import { useLocalStorage } from '@vueuse/core'
import type { RemovableRef, UseStorageOptions } from '@vueuse/core'
```

## useLocalStorage

Returns `RemovableRef<T>` (a `Ref` with `.remove()`). Pass a typed initial value so `T` is inferred:

```ts
type Prefs = { theme: 'light' | 'dark'; lang: 'en' | 'fa' }

const prefs: RemovableRef<Prefs> = useLocalStorage<Prefs>('app.prefs', {
  theme: 'light',
  lang: 'en',
})

prefs.value.lang = 'fa'
prefs.remove() // clears the storage key
```

`useLocalStorage` is `useStorage` bound to `window.localStorage`. Optional third argument: `UseStorageOptions<T>` from the package (`deep`, `listenToStorageChanges`, `serializer`, …).

## Pinia

Call VueUse composables inside a setup store; keep a single persisted object and expose `computed` getters + setters rather than duplicating manual `JSON.parse` / type guards.

## Anti-patterns

- Untyped `useLocalStorage('key', {})` without a generic / typed default
- Hand-rolled `localStorage` + `JSON.parse` when `useLocalStorage` already covers persistence
- Casting storage values as `any`
- Using `useDraggable` for file/folder list reorder — use `vue-draggable-next` (SortableJS) instead
