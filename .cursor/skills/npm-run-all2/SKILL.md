---
name: npm-run-all2
description: >
  Parallel/serial npm scripts via npm-run-all2 (run-p / run-s) in apps/web. Use
  when editing package.json scripts that combine type-check, build, or lint.
---

# npm-run-all2

Docs: [github.com/bcomnes/npm-run-all2](https://github.com/bcomnes/npm-run-all2).  
Version: `npm-run-all2` **^9** in `apps/web` (CLI: `run-p`, `run-s`).

## This repo (`apps/web/package.json`)

```json
{
  "build": "run-p type-check \"build-only {@}\" --",
  "lint": "run-s \"lint:*\""
}
```

- `run-p` — parallel (type-check + vite build)
- `run-s` — serial (`lint:oxlint` then `lint:eslint`)

Still install/run package manager tasks with **pnpm** only.

## Anti-patterns

- Nesting scripts that hide failures without `--`
- Switching the monorepo to npm/yarn because of this package name
