---
name: zod
description: >
  Type-safe Zod schema design — shared @vue-nestjs-admin-template/schemas contract, NestJS
  ZodValidationPipe, z.infer / ZodType / safeParse only. Use when writing DTOs,
  API validation, or shared request schemas.
---

# Zod (type-safe)

Docs: [zod.dev](https://zod.dev). Confirm version in `packages/schemas/package.json` and app `package.json` files.

## Source of truth (this monorepo)

Domain request schemas live in **`@vue-nestjs-admin-template/schemas`** (`packages/schemas`). Apps import from there — do not redefine user/role/permission bodies in `apps/api` or invent parallel interfaces.

```ts
import { createRoleSchema, type CreateRoleDto } from '@vue-nestjs-admin-template/schemas';
import type { ZodType } from 'zod';
```

- Prefer `z.infer<typeof schema>` for DTO types (exported from the shared package)
- Prefer `ZodType` for generic pipes — not `any`
- Prefer `.strict()` on request bodies
- Prefer `safeParse` in pipes; map `ZodError` / `flatten()` to HTTP 400

## Nest pipe pattern

```ts
import type { ZodType } from 'zod';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { createUserSchema, type CreateUserDto } from './user.schemas';

@Body(new ZodValidationPipe(createUserSchema))
dto: CreateUserDto
```

API `*.schemas.ts` files are **thin re-exports** of `@vue-nestjs-admin-template/schemas` so controllers keep local import paths.

## Vue / antdv

See `.cursor/rules/shared-validation.mdc` and `apps/web/src/validation/zod-rule.ts` — antdv may add extra UX rules on top of shared Zod, never looser duplicates.

## Entity id lists (Permission['id'][])

Assignment fields are typed from the entity (`Permission['id']`), via Zod helpers in `common.ts`:

```ts
import { permissionIdSchema, roleIdSchema } from './common';

permissionIds: z.array(permissionIdSchema) // Permission['id'][]
roleIds: z.array(roleIdSchema)             // Role['value'][] (unique slug)
```

OpenAPI uses separate `PermissionId` / `RoleId` schemas — that is intentional and does not replace this TS pattern. `Role['value']` is a unique slug, not a UUID.

## Auth

```ts
import { loginSchema, type LoginDto } from '@vue-nestjs-admin-template/schemas';
```

Login lives in `packages/schemas/src/auth.ts`; Nest and Vue forms both consume it.

## Anti-patterns

- Hand-written `interface CreateUserDto` that drifts from the schema
- Copy-pasting Zod objects into both api and web
- `as any` / untyped `parse` results
- Raw `z.string().uuid()` for assignment ids instead of `permissionIdSchema` / `roleIdSchema`
