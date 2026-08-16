---
name: pinia
description: >
  Type-safe Pinia stores in apps/web — defineStore setup stores, storeToRefs,
  typed state/actions. Use when creating or editing Pinia stores (pinia ^4).
---

# Pinia (type-safe)

Docs: [pinia.vuejs.org](https://pinia.vuejs.org). Version: `pinia` **^4** in `apps/web`.

## Source of truth

```ts
import { defineStore, storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
```

Use package exports only — do not hand-roll a parallel store typing layer or cast store state as `any`.

## Setup store pattern (this repo)

```ts
import type { PaginationQuery } from '@vue-nestjs-admin-template/schemas'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userList = ref<PublicUser[]>([])
  const total = ref(0)
  const loading = ref(false)

  async function fetchPage(
    query: PaginationQuery = { page: 1, pageSize: 10 },
  ): Promise<void> {
    loading.value = true
    try {
      const result = await usersApi.list(query)
      userList.value = result.items
      total.value = result.total
    } finally {
      loading.value = false
    }
  }

  return { userList, total, loading, fetchPage }
})
```

In views, destructure reactive state with **`storeToRefs`** from `pinia` (not `vue`):

```ts
import { storeToRefs } from 'pinia'

const userStore = useUserStore()
const { page, pageSize, total } = storeToRefs(userStore)
```

Actions can be destructured directly (`const { fetchPage } = userStore`).

## Anti-patterns

- `storeToRefs` from `vue`
- Options-style `state: () => ({})` for new stores unless matching legacy
- Mutating store state outside actions without clear need
