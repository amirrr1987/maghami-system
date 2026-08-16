---
name: vue
description: >
  Type-safe Vue 3 Composition API in apps/web — ref, computed, defineProps,
  defineEmits, script setup. Use when writing Vue SFCs, composables, or Vue
  reactivity (vue ^3.5).
---

# Vue 3 (type-safe)

Docs: [vuejs.org](https://vuejs.org). Version: `vue` **^3.5** in `apps/web/package.json`.

## Source of truth

Import APIs and types from **`vue`** — do not invent parallel component/prop types or use `any`:

```ts
import {
  computed,
  onMounted,
  reactive,
  ref,
  type Component,
  type Ref,
} from 'vue';
```

## Patterns (this repo)

- Prefer `<script setup lang="ts">`
- Typed props via `defineProps<{ … }>()` or interfaces built from package types of child libs
- Prefer `ref` / `computed` over Options API
- Template auto-unwraps refs; in script use `.value`

```ts
const open = ref(false)
const title = computed(() => (open.value ? 'Edit' : 'Create'))

onMounted(async () => {
  await store.fetchPage()
})
```

## Anti-patterns

- `any` on props/emits/refs
- Mixing Options API for new code
- Untyped `defineEmits` without payload types

```ts
const emit = defineEmits<{
  save: [id: string]
  cancel: []
}>()
```
