---
name: jiti
description: >
  jiti TypeScript loader for Node tooling in apps/web (eslint.config.ts). Use
  when running TS config files under Node or debugging flat ESLint config load.
---

# jiti

Docs: [github.com/unjs/jiti](https://github.com/unjs/jiti). Version: `jiti` **^2.7** in `apps/web`.

Used so Node can load TypeScript config (e.g. `eslint.config.ts`) without a separate compile step.

```ts
// Typically transitive via ESLint / tooling — prefer package defaults
import { createJiti } from 'jiti'
```

## Anti-patterns

- Replacing app runtime imports with jiti (app code goes through Vite/vue-tsc)
- Inventing custom loaders when Vite already handles app TS
