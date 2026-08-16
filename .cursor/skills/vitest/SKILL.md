---
name: vitest
description: >
  Type-safe Vitest 4 unit tests in apps/web — describe/it/expect, vue-test-utils
  mounting, jsdom. Use when writing unit tests, vitest.config, or
  @vitest/eslint-plugin rules.
---

# Vitest (type-safe)

Docs: [vitest.dev](https://vitest.dev). Version: `vitest` **^4** in `apps/web`.  
Related: `vue-test-utils`, `jsdom`, ESLint via `@vitest/eslint-plugin` (`eslint` skill).

## Source of truth

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Mock } from 'vitest'
```

## This repo

- Config: `apps/web/vitest.config.ts`
- Script: `pnpm --filter @vue-nestjs-admin-template/web test:unit`
- Tests under `src/**/__tests__/*`

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'

describe('App', () => {
  it('mounts', () => {
    expect(wrapper.text()).toBeTruthy()
  })
})
```

Prefer typed mocks (`vi.fn<[Args], Return>()` / `Mock`) — not `any`.

## Anti-patterns

- Untyped `as any` on wrappers/mocks
- Putting e2e flows in Vitest — use Playwright (`playwright` skill)
