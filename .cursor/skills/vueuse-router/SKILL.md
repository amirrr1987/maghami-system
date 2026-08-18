---
name: vueuse-router
description: >
  Type-safe @vueuse/router v14 in apps/web — useRouteQuery, useRouteParams,
  useRouteHash, ReactiveRouteOptions. Use when syncing refs with vue-router
  query/params/hash.
---

# @vueuse/router (type-safe)

Docs: [vueuse.org/router](https://vueuse.org/router/useRouteQuery/).  
Version: `@vueuse/router` **14.4.0**. Peer: `vue-router` **^5**.

## Source of truth

Public exports are **only** the three composables (no named option types):

```ts
import { useRouteHash, useRouteParams, useRouteQuery } from '@vueuse/router'
```

Do not invent parallel query-ref types. Option shapes live in the package `.d.ts` but are **not** re-exported — type them by inference (generics on the composable) or inline object literals.

Internal signatures (do not copy into app `types/`):

```ts
type RouteQueryValueRaw = RouteParamValueRaw | string[] // from vue-router
type RouteHashValueRaw = string | null | undefined

interface ReactiveRouteOptions {
  mode?: MaybeRef<'replace' | 'push'> // default 'replace'
  route?: ReturnType<typeof useRoute>
  router?: ReturnType<typeof useRouter>
}

interface ReactiveRouteOptionsWithTransform<V, R> extends ReactiveRouteOptions {
  transform?:
    | ((val: V) => R)
    | { get?: (value: V) => R; set?: (value: R) => V }
}
```

## Signatures

```ts
function useRouteHash(
  defaultValue?: MaybeRefOrGetter<RouteHashValueRaw>,
  options?: ReactiveRouteOptions,
): Ref<RouteHashValueRaw>

function useRouteParams(name: string): Ref<null | string | string[]>
function useRouteParams<T extends RouteParamValueRaw = RouteParamValueRaw, K = T>(
  name: string,
  defaultValue?: MaybeRefOrGetter<T>,
  options?: ReactiveRouteOptionsWithTransform<T, K>,
): Ref<K>

function useRouteQuery(name: string): Ref<undefined | null | string | string[]>
function useRouteQuery<T extends RouteQueryValueRaw = RouteQueryValueRaw, K = T>(
  name: string,
  defaultValue?: MaybeRefOrGetter<T>,
  options?: ReactiveRouteOptionsWithTransform<T, K>,
): Ref<K>
```

```ts
import { useRouteQuery } from '@vueuse/router'
import { computed } from 'vue'

const page = useRouteQuery('page', '1', {
  mode: 'replace',
  transform: {
    get: (value: string) => Number(value) || 1,
    set: (value: number) => String(value),
  },
})
const pageLabel = computed(() => `صفحه ${page.value}`)
```

Must run inside a component/setup that has an active `vue-router` instance (same as `useRoute()`).

## Anti-patterns

- Hand-rolled `watch` + `router.replace({ query })` when `useRouteQuery` covers it
- Untyped `transform` / `as any` on query values
- Using `push` mode for pagination filters unless history entries are required
- Confusing with Pinia — query state belongs in the URL via these refs
