---
name: nestjs-cli
description: >
  Nest CLI and schematics for apps/api — nest build/start/generate. Use when
  scaffolding modules, editing nest-cli.json, or @nestjs/cli / @nestjs/schematics.
---

# @nestjs/cli + @nestjs/schematics

Docs: [docs.nestjs.com/cli](https://docs.nestjs.com/cli).  
Versions: `@nestjs/cli` **^10**, `@nestjs/schematics` **^10** in `apps/api` devDependencies.

## This repo scripts

```bash
pnpm dev:api                         # build schemas, then nest start --watch
pnpm --filter @vue-nestjs-admin-template/api build  # nest build (prebuild compiles schemas)
pnpm --filter @vue-nestjs-admin-template/api start
```

`@vue-nestjs-admin-template/schemas` must be compiled to `packages/schemas/dist` before Nest can resolve the package (types + CommonJS). Root `dev` / `dev:api` and the API `predev` / `prebuild` scripts do that.

Global prefix: **`/v1`**. Responses are wrapped in `ApiResult` via `ResultInterceptor` / `ResultExceptionFilter` in `main.ts`.

Prefer generating into `apps/api/src` with Nest schematics when scaffolding; keep modules aligned with existing RBAC / Zod patterns.

## Anti-patterns

- Global `npm i -g @nestjs/cli` for this monorepo — use workspace **pnpm** scripts
- Generated DTOs with `class-validator` when this repo uses Zod + `@vue-nestjs-admin-template/schemas`
