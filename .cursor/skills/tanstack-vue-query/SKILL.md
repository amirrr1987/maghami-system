---
name: tanstack-vue-query
description: >
  Type-safe TanStack Vue Query v5 in apps/web — VueQueryPlugin, QueryClient,
  useQuery, useMutation, queryKeys. Use when fetching or mutating server data
  (lists, CRUD) instead of Pinia stores.
---

# @tanstack/vue-query (type-safe)

Docs: [tanstack.com/query/latest/docs/framework/vue](https://tanstack.com/query/latest/docs/framework/vue/overview). Version: `@tanstack/vue-query` **^5** in `apps/web`.

## Source of truth

Import from **`@tanstack/vue-query`**. Do not invent parallel cache/store types or use `any`.

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
  UseQueryOptions,
  UseMutationOptions,
  VueQueryPluginOptions,
} from '@tanstack/vue-query'
```

`defaultError` / `queryMeta` are augmented in `apps/web/src/query/register.d.ts` (`Register` from the package).

## This repo

- **Plugin:** `apps/web/src/main.ts` — `app.use(VueQueryPlugin, { queryClient })` with the singleton in `apps/web/src/query/client.ts`
- **Keys:** `apps/web/src/query/keys.ts` — `queryKeys.users.list(query)` (prefix `all` for invalidate)
- **Composables:** `apps/web/src/queries/use-*.ts` — `useQuery` for lists, `useMutation` for create/update/delete
- **Pinia** stays for session (`auth.store`) and UI prefs (`configProvider.store`) only

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

Return the composable result from **`reactive({ ... })`** so templates unwrap `productList` / `loading`. In views, take pagination refs with **`toRefs`** from `vue` (not Pinia `storeToRefs`):

```ts
import { toRefs } from 'vue'

const users = useUsers()
const { page, pageSize, total } = toRefs(users)
```

## Anti-patterns

- Pinia stores that duplicate list/CRUD cache already in Vue Query
- Hand-rolled `loading`/`items` refs instead of `useQuery` `data` / `isFetching`
- Untyped `queryKey: string` or `as any` on mutation variables
- Calling `useQueryClient()` in `main.ts` before `app.use(VueQueryPlugin)` — use the exported `queryClient` singleton
