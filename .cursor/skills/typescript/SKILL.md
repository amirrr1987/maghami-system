---
name: typescript
description: >
  TypeScript compilerOptions for this monorepo — Nest API uses commonjs +
  bundler (TS 6); web uses Vue/Vite. Use when editing tsconfig, fixing
  moduleResolution deprecations, or aligning TypeScript majors across apps.
---

# TypeScript (this repo)

Confirm versions in each app `package.json` (`typescript`). Prefer matching majors across apps when possible.

## apps/api (NestJS)

Keep CommonJS emit for Nest. On **TypeScript 6+**:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "bundler"
  }
}
```

Do **not** use `"moduleResolution": "node"` / `node10` (deprecated in TS 6, removed in TS 7).

`bundler` + `commonjs` requires TypeScript **≥ 6**. On TS 5.x that pair errors with TS5095 — either upgrade TS or use `"module"` / `"moduleResolution": "Node16"` (or `NodeNext`) instead.

Decorators for Nest stay on:

```json
"emitDecoratorMetadata": true,
"experimentalDecorators": true
```

## apps/web

Vue + Vite — follow `tsconfig.app.json` / `@vue/tsconfig`. Do not force Nest’s `commonjs` settings into the web app.

`@maghami-system/schemas` stays CommonJS for Nest (`packages/schemas` → `dist/`). Vite aliases that package to `packages/schemas/src/index.ts` in `apps/web/vite.config.ts` so named Zod exports work under native ESM — do not remove that alias without adding an ESM (or dual) schemas build.

## Anti-patterns

- Silencing with only `"ignoreDeprecations": "6.0"` when a real migration is easy
- Mixing `moduleResolution: bundler` with `module: commonjs` on TypeScript 5.x
- Inventing custom module settings that fight Nest emit or Vite resolve
