---
name: tanstack-vue-query
description: >
  Type-safe TanStack Vue Query v5 in apps/web — QueryClient, UseQueryOptions,
  UseMutationOptions, Register, QueryKey. Use when fetching or mutating server
  data instead of Pinia list stores.
---

# @tanstack/vue-query (type-safe)

Docs: [tanstack.com/query/latest/docs/framework/vue](https://tanstack.com/query/latest/docs/framework/vue/overview).  
Version: `@tanstack/vue-query` **5.101.4**.

## Source of truth

Import from **`@tanstack/vue-query`**. Do not invent cache types.

```ts
import {
  VueQueryPlugin,
  QueryClient,
  QueryCache,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/vue-query'
import type {
  QueryClientConfig,
  DefaultOptions,
  VueQueryPluginOptions,
  UseQueryOptions,
  UseQueryReturnType,
  UseMutationOptions,
  UseMutationReturnType,
  QueryKey,
  QueryFunction,
  InvalidateQueryFilters,
  Register,
} from '@tanstack/vue-query'
```

`defaultError` / `queryMeta` are augmented via package `Register`:

`apps/web/src/query/register.d.ts` — `defaultError: ApiError`, `queryMeta.errorMessage?: string`.

## Plugin + client

```ts
import { QueryCache, QueryClient } from '@tanstack/vue-query'
import type { QueryClientConfig } from '@tanstack/vue-query'

const config: QueryClientConfig = {
  queryCache: new QueryCache({
    onError: (error, query) => {
      notifyApiError(error, query.meta?.errorMessage ?? 'بارگذاری ناموفق بود')
    },
  }),
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
}
export const queryClient = new QueryClient(config)
```

`apps/web/src/main.ts`: `app.use(VueQueryPlugin, { queryClient } satisfies VueQueryPluginOptions)`.

## This repo

- Keys: `apps/web/src/query/keys.ts` — `QueryKey` arrays (`queryKeys.users.list(query)`)
- Composables: `apps/web/src/queries/use-*.ts`
- Pinia: session + UI prefs only

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed, ref } from 'vue'
import { queryKeys } from '@/query/keys'

const page = ref(1)
const queryClient = useQueryClient()

const listQuery = useQuery({
  queryKey: computed(() => queryKeys.users.list({ page: page.value, pageSize: 5 })),
  queryFn: () => usersApi.list({ page: page.value, pageSize: 5 }),
  meta: { errorMessage: 'بارگذاری کاربران ناموفق بود' },
})

const createMutation = useMutation({
  mutationFn: (dto: CreateUserDto) => usersApi.create(dto),
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
  },
})
```

`useQuery` → `UseQueryReturnType`; `useMutation` → `UseMutationReturnType`. Unwrap list composables with `reactive` + `toRefs` from **`vue`**.

## Anti-patterns

- Pinia stores that duplicate Vue Query lists
- Hand-rolled `loading` / `items` instead of `data` / `isFetching`
- Untyped `queryKey: string` or `as any` on mutation variables
- `useQueryClient()` in `main.ts` before the plugin — use the exported singleton
