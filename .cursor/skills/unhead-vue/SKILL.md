---
name: unhead-vue
description: >
  Type-safe @unhead/vue 3 in apps/web — createHead (@unhead/vue/client),
  useHead, UseHeadInput, ReactiveHead, VueHeadClient. Use when setting document
  title, meta, html/body attrs.
---

# @unhead/vue (type-safe)

Docs: [unhead.unjs.io](https://unhead.unjs.io/docs/vue/head/guides/get-started/installation).  
Version: `@unhead/vue` **3.0.0-beta.9**.

## Source of truth

```ts
import { createHead } from '@unhead/vue/client'
import { useHead } from '@unhead/vue'
import type {
  UseHeadInput,
  UseHeadOptions,
  VueHeadClient,
  ReactiveHead,
  ActiveHeadEntry,
} from '@unhead/vue'
```

SPA: `createHead` from **`@unhead/vue/client`** (`createHead(options?: CreateClientHeadOptions): VueHeadClient`).

```ts
type VueHeadClient<I = UseHeadInput> = Unhead<I> & Plugin
type UseHeadInput = ResolvableValue<ReactiveHead>
type UseHeadOptions = Omit<HeadEntryOptions, 'head'> & { head?: VueHeadClient }

function useHead<I = UseHeadInput>(
  input?: UseHeadInput,
  options?: UseHeadOptions,
): ActiveHeadEntry<I>
```

`useHead` does **not** return `setTitle`. Update via reactive input or `ActiveHeadEntry.patch`.

## ReactiveHead (input shape)

Fields: `title?`, `titleTemplate?`, `templateParams?`, `base?`, `link?`, `meta?`, `style?`, `script?`, `noscript?`, `htmlAttrs?`, `bodyAttrs?`.

Values may be plain, `Ref`, `ComputedRef`, getter, or falsy (`false | null | undefined`).

```ts
import { createHead } from '@unhead/vue/client'
import { useHead } from '@unhead/vue'
import type { UseHeadInput, VueHeadClient } from '@unhead/vue'
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
const head: VueHeadClient = createHead()
app.use(head)

const input: UseHeadInput = {
  title: 'Web',
  htmlAttrs: { lang: 'fa', dir: 'rtl' },
}
useHead(input)
```

Also: `useHeadSafe`, `useSeoMeta` (`UseSeoMetaInput`), `injectHead(): VueHeadClient`.

## Anti-patterns

- `useHead()` then `.setTitle(...)`
- `createHead` from `@unhead/vue` root in this SPA
- Hand-rolled `interface HeadTags` / `document.title =` when Unhead is wired
- `any` on head input
