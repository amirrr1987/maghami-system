---
name: oxfmt
description: >
  Format apps/web with oxfmt — format script for src/. Use when formatting Vue/TS
  sources or changing the format pipeline (oxfmt ^0.59).
---

# oxfmt

Docs: [oxc.rs](https://oxc.rs). Version: `oxfmt` **^0.59** in `apps/web`.

## This repo

```bash
pnpm --filter @maghami-system/web format
# → oxfmt src/
```

ESLint uses `eslint-config-prettier/flat` so formatting stays with oxfmt — do not reintroduce Prettier/ESLint format fights.

## Anti-patterns

- Running Prettier in parallel without aligning ignore/format scope
- Formatting `dist/` or generated files
