---
name: vue-tsconfig
description: >
  Shared TS bases @vue/tsconfig + @tsconfig/node24 for apps/web. Use when
  editing tsconfig.app.json, tsconfig.node.json, or Vue/Node compiler options.
---

# @vue/tsconfig + @tsconfig/node24

Versions in `apps/web`: `@vue/tsconfig` **^0.9**, `@tsconfig/node24` **^24**.  
Also see `typescript` skill for monorepo TS majors.

## Source of truth

Extend published bases — do not fork a parallel base tsconfig:

```json
{
  "extends": "@vue/tsconfig/tsconfig.dom.json"
}
```

```json
{
  "extends": "@tsconfig/node24/tsconfig.json"
}
```

Typical split: app/DOM config vs Node tooling (`vite.config.ts`, etc.).

## Anti-patterns

- Copy-pasting entire bases into the repo
- Diverging `moduleResolution` from the `typescript` skill / Nest without reason
