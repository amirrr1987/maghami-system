---
name: types-node
description: >
  @types/node for Node APIs in apps/web and apps/api — Buffer, process, url,
  path. Use when typing Node built-ins in Vite/Nest tooling or server code.
---

# @types/node (type-safe)

Versions: `apps/web` **^24**, `apps/api` **^22** (align with each app's engines).

## Source of truth

```ts
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import type { Buffer } from 'node:buffer'
```

Prefer `node:` protocol imports. Types come from `@types/node` ambient/`node` module — do not declare parallel `process` interfaces.

## Anti-patterns

- `require` typings without `@types/node` in the package
- Mixing Node 22 vs 24 APIs without checking the target app's engines
