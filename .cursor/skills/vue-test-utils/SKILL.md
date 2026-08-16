---
name: vue-test-utils
description: >
  Type-safe @vue/test-utils for Vue 3 — mount, VueWrapper, DOMWrapper. Use when
  writing Vitest component tests in apps/web.
---

# @vue/test-utils (type-safe)

Docs: [test-utils.vuejs.org](https://test-utils.vuejs.org). Version: `@vue/test-utils` **^2.4** in `apps/web`. Pair with `vitest` skill.

## Source of truth

```ts
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import type { ComponentPublicInstance } from 'vue'
```

## Typed mount

```ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import LoginView from '@/views/auth/LoginView.vue'

const wrapper = mount(LoginView, {
  global: {
    plugins: [router, pinia],
  },
})

expect(wrapper.find('form').exists()).toBe(true)
```

When extracting helpers, type the wrapper:

```ts
function getForm(wrapper: VueWrapper<ComponentPublicInstance>) {
  return wrapper.get('form')
}
```

## Anti-patterns

- Untyped `wrapper.vm` casts to `any`
- Skipping `global.plugins` for Pinia/Router then asserting store/router behavior
