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

On **TypeScript 6+**, set `rootDir` explicitly (default is now the tsconfig directory, not the common source root):

```json
"rootDir": "./src",
"outDir": "./dist"
```

Without `"rootDir": "./src"`, emit becomes `dist/src/...` and the language service reports TS5101.

With Nest `"deleteOutDir": true` + TS 6 incremental, put the build info **inside** `outDir` so it is wiped with `dist/`:

```json
"tsBuildInfoFile": "./dist/tsconfig.tsbuildinfo"
```

Otherwise a stale `tsconfig.build.tsbuildinfo` at the app root makes tsc report 0 errors but emit nothing → `Cannot find module '.../dist/main'`.
## apps/web

Vue + Vite — follow `tsconfig.app.json` / `@vue/tsconfig`. Do not force Nest’s `commonjs` settings into the web app.

`@maghami-system/schemas` stays CommonJS for Nest (`packages/schemas` → `dist/`).

- `apps/api/tsconfig.json` and `apps/api/tsconfig.build.json` `paths` → `packages/schemas/dist/index.d.ts`
- `apps/web/tsconfig.app.json` `paths` and `apps/web/vite.config.ts` alias → source

Do **not** map the Nest API tsconfig at schemas `src` — that pulls those files into the API program and TS6059 (`rootDir` is `apps/api/src`). Build schemas first (`pnpm --filter @maghami-system/schemas build`), then typecheck the API.

Do not remove the Vite alias without an ESM (or dual) schemas build.

On **TypeScript 6+**, do **not** set `baseUrl` (deprecated; removed in TS 7). Put the former `baseUrl` prefix into each `paths` entry instead — this repo already uses roots like `../../packages/schemas/...` relative to the tsconfig file, so remove `baseUrl` and keep those paths as-is. Prefer that over `"ignoreDeprecations": "6.0"`.

## Anti-patterns

- Silencing with only `"ignoreDeprecations": "6.0"` when a real migration is easy (e.g. dropping unused `baseUrl`)
- Mixing `moduleResolution: bundler` with `module: commonjs` on TypeScript 5.x
- Inventing custom module settings that fight Nest emit or Vite resolve
