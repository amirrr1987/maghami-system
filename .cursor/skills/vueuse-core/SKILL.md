---
name: vueuse-core
description: >
  Type-safe @vueuse/core v14 in apps/web — useLocalStorage, RemovableRef,
  UseStorageOptions, Serializer. Use when persisting UI prefs or VueUse
  composables from @vueuse/core.
---

# @vueuse/core (type-safe)

Docs: [vueuse.org](https://vueuse.org). Version: `@vueuse/core` **14.4.0** (`@vueuse/shared` same version).

## Source of truth

```ts
import { useLocalStorage } from '@vueuse/core'
import type { RemovableRef, UseStorageOptions, Serializer } from '@vueuse/core'
```

`RemovableRef` is re-exported from `@vueuse/shared`:

```ts
type RemovableRef<T> = Ref<T, T | null | undefined>
```

It is a Vue `Ref` whose **setter** allows `null | undefined` (clears storage). There is **no** `.remove()` method on this type in v14.

## UseStorageOptions\<T\>

From `useStorage` (also the 3rd argument of `useLocalStorage`):

```ts
interface Serializer<T> {
  read: (raw: string) => T
  write: (value: T) => string
}

interface UseStorageOptions<T>
  extends ConfigurableEventFilter, ConfigurableWindow, ConfigurableFlush {
  deep?: boolean
  listenToStorageChanges?: boolean
  writeDefaults?: boolean
  mergeDefaults?: boolean | ((storageValue: T, defaults: T) => T)
  serializer?: Serializer<T>
  onError?: (error: unknown) => void
  shallow?: boolean
  initOnMounted?: boolean
}
```

Inherited (from `@vueuse/shared` / `@vueuse/core`): `eventFilter?`, `window?`, `flush?: WatchOptions['flush']`.

## useLocalStorage

```ts
function useLocalStorage<T>(
  key: MaybeRefOrGetter<string>,
  initialValue: MaybeRefOrGetter<T>,
  options?: UseStorageOptions<T>,
): RemovableRef<T>
```

Overloads also exist for `string` / `boolean` / `number`.

```ts
type Prefs = { theme: 'light' | 'dark'; lang: 'en' | 'fa' }

const prefs: RemovableRef<Prefs> = useLocalStorage<Prefs>('app.prefs', {
  theme: 'light',
  lang: 'en',
})

prefs.value.lang = 'fa'
prefs.value = null // allowed by RemovableRef setter
```

This app: `apps/web/src/stores/configProvider.store.ts`.

## Anti-patterns

- Claiming `.remove()` exists on `RemovableRef` (v14)
- Untyped `useLocalStorage('key', {})`
- Duplicate `JSON.parse` / `localStorage` wrappers
- `useDraggable` for list reorder — `vue-draggable-next`
