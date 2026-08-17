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

## This repo

Pinia is for **client state**:

- `auth.store` — session, tokens, abilities
- `configProvider.store` — theme / locale prefs (`useLocalStorage`)

**Server lists and CRUD** use `@tanstack/vue-query` (`apps/web/src/queries/`). Do not add a new Pinia store that fetches paginated API data.

## Setup store pattern

```ts
import { defineStore, storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const isAuthenticated = computed(() => Boolean(accessToken.value))
  function clearSession(): void {
    accessToken.value = null
  }
  return { accessToken, isAuthenticated, clearSession }
})
```

In views, destructure reactive Pinia state with **`storeToRefs`** from `pinia` (not `vue`):

```ts
import { storeToRefs } from 'pinia'

const auth = useAuthStore()
const { accessToken } = storeToRefs(auth)
```

Actions can be destructured directly (`const { clearSession } = auth`).

Vue Query composables already return `ref` / `computed` — destructure them without `storeToRefs`.

## Anti-patterns

- `storeToRefs` from `vue`
- Options-style `state: () => ({})` for new stores unless matching legacy
- Mutating store state outside actions without clear need
- Duplicating Vue Query cache in Pinia (`userList`, `loading`, `fetchPage`)
