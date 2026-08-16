---
name: playwright
description: >
  Type-safe Playwright e2e for apps/web — @playwright/test fixtures, Page,
  expect. Use when writing e2e specs, playwright.config, or browser automation
  tests.
---

# Playwright (type-safe)

Docs: [playwright.dev](https://playwright.dev). Version: `@playwright/test` **^1.61** in `apps/web`.

## Source of truth

```ts
import { test, expect, type Page, type Locator } from '@playwright/test'
```

## This repo

- Config: `apps/web/playwright.config.ts`
- Specs: `apps/web/e2e/**`
- Script: `pnpm --filter @maghami-system/web test:e2e`
- ESLint: `eslint-plugin-playwright` (`eslint` skill)

```ts
import { test, expect } from '@playwright/test'

test('login page renders', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('button', { name: /ورود/i })).toBeVisible()
})
```

Prefer role/label locators; type `Page` / `Locator` when extracting helpers.

## Anti-patterns

- `page as any` / untyped helper args
- Sleeping with fixed timeouts instead of `expect` auto-wait
- Mixing unit assertions into e2e without need
