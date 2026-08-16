---
name: jsdom
description: >
  jsdom + @types/jsdom for Vitest DOM environment in apps/web. Use when
  configuring test environment, window/document in unit tests, or jsdom types.
---

# jsdom (type-safe)

Docs: [github.com/jsdom/jsdom](https://github.com/jsdom/jsdom).  
Versions: `jsdom` **^29**, `@types/jsdom` **^28** in `apps/web` (Vitest environment).

## Source of truth

Prefer Vitest's jsdom environment; when typing jsdom directly:

```ts
import { JSDOM } from 'jsdom'
import type { DOMWindow } from 'jsdom'
```

## This repo

Unit tests run under Vitest + jsdom (see `vitest.config.ts`). Prefer Testing Library / Vue Test Utils over raw `JSDOM` unless needed.

## Anti-patterns

- Untyped `window as any`
- Using jsdom for e2e — use Playwright
