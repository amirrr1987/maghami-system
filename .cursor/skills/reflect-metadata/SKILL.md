---
name: reflect-metadata
description: >
  reflect-metadata polyfill required by NestJS / TypeORM decorators. Use when
  bootstrap fails on missing Reflect metadata or editing apps/api entry imports.
---

# reflect-metadata

Docs: [rbuckton/reflect-metadata](https://www.npmjs.com/package/reflect-metadata).  
Version: `reflect-metadata` **^0.2** in `apps/api`.

## Usage

Import once at process entry before other decorated imports (Nest typically ensures this via `main.ts` / tooling):

```ts
import 'reflect-metadata'
```

Required for `emitDecoratorMetadata` + Nest/TypeORM DI. Do not reimplement `Reflect.defineMetadata` helpers.

## Anti-patterns

- Removing the dependency while Nest/TypeORM decorators remain
- Multiple conflicting polyfills
