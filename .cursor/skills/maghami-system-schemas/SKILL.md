---
name: maghami-system-schemas
description: >
  Shared @maghami-system/schemas Zod contracts — DTOs, pagination, auth entities.
  Use when changing API/web request/response shapes or importing from
  packages/schemas (workspace package).
---

# @maghami-system/schemas (type-safe)

Workspace package: `packages/schemas`. Apps depend via `"@maghami-system/schemas": "workspace:*"`.

Also see skills: `zod`, and rule `.cursor/rules/shared-validation.mdc`.

## Source of truth

All shared request/response contracts live here. Import from the package — never duplicate Zod rules in Nest controllers or invent parallel DTO interfaces in Vue.

```ts
import {
  createUserSchema,
  paginationQuerySchema,
  type CreateUserDto,
  type PaginationQuery,
  type PaginatedResult,
} from '@maghami-system/schemas'
```

## Build / watch / editor

- **Editor / ESLint / vue-tsc** resolve this package to `packages/schemas/src` via `paths` in `apps/api/tsconfig.json` and `apps/web/tsconfig.app.json` (same idea as the Vite alias).
- **Nest emit / Node** still `require()` CommonJS from `dist/`. `tsconfig.build.json` maps types at `dist` so `nest build` does not compile schemas source into the API.
- After editing schemas source, rebuild `dist` before API runtime:

```bash
pnpm --filter @maghami-system/schemas build
```

`pnpm dev` / `pnpm run dev:api` build once, then run **schemas `tsc --watch` in parallel** with the API. Prefer those scripts over `pnpm --filter api dev` alone.

A missing `packages/schemas/dist` is a runtime/`Cannot find module` failure until the first build. Editor squiggles that contradict a green `nest build` are stale `dist` — not a Nest compile error.

Workspace: `.vscode/settings.json` sets `eslint.workingDirectories` so each app uses its own flat ESLint config. After changing tsconfig paths, **Developer: Reload Window**.

## Layers

1. **Zod** in `packages/schemas/src/*` — `.strict()`, lengths, formats
2. **API** — thin `*.schemas.ts` re-exports + `ZodValidationPipe`
3. **Web** — `zodRule(...)` for antdv; may add stricter UX rules only

## Pagination

```ts
import type { PaginatedResult, PaginationQuery } from '@maghami-system/schemas'

// Query: page, pageSize → PaginatedResult<T> { items, total, page, pageSize }
```

## ApiResult envelope

All Nest JSON responses (under `/v1`) use:

```ts
import type { ApiResult } from '@maghami-system/schemas'
import { okResult, failResult } from '@maghami-system/schemas'

// { status, message: string[], isSuccess, data? }
// CRUD success: message like ["Created successfully"]
// Errors: isSuccess false, message lists each validation/HTTP error
```

Web `apiRequest` unwraps `data`; do not re-wrap in Vue stores.

## Role / LabelValue

`Role` is `{ label, value }` (extends `LabelValue`). `label` is display (any language, not unique). `value` is a unique lowercase slug. Nested user roles are `RoleRef`. Assignment lists are `Role['value'][]`.

`super-admin` is a **system role**: not editable, not bound to the permission catalog. Access is the `*` sentinel (`SUPER_ADMIN_PERMISSION_CODE` / `isSuperAdminRoleValue`).

## Permission / ability

Catalog vocabulary is **enum-backed** in this package:

```ts
import {
  PermissionAction,
  PermissionResource,
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
  permissionKey,
} from '@maghami-system/schemas'
```

- `PermissionResource` — `users` | `roles` | `permissions` | `files` | `products` | `product-categories` | `product-brands` | `product-units` | `product-attributes` | `product-code-patterns`
- `PermissionAction` — `read` | `create` | `update` | `delete` (`write` is not an alias)
- Catalog row: `{ resource, action, name }` with **unique `(resource, action)`** (no separate `code` column)
- Bootstrap seeds `SEEDED_PERMISSION_RESOURCES` (same core catalog as `PERMISSION_RESOURCES`)
- Image uploads: `IMAGE_UPLOAD` / `isAllowedImageMime` in `upload.ts` (API + web)
- File bytes: local disk via `FileStorage` / `LocalDiskStorage` (`UPLOAD_DIR`)
- Session `abilities` use `AbilityAction` / `AbilitySubject` (catalog enums + `manage`/`all` for super-admin)
- Session `permissionCodes` are derived display keys (`resource:action`, plus `*` for super-admin)

Self-service profile (`PATCH /auth/me`): `updateProfileSchema` / `UpdateProfileDto` — name, email, optional password, optional `avatarFileId`. Not `users:update`; cannot change roles or `isActive`.

Auth tokens: `LoginResult` is session + `accessToken` + `tokenType` + `accessTokenExpiresIn` + `refreshTokenExpiresIn` (seconds). Refresh JWT is HttpOnly cookie only, not in JSON.

```ts
import {
  abilityCovers,
  PermissionAction,
  PermissionResource,
  type AbilityRule,
} from '@maghami-system/schemas'
```

## Anti-patterns

- Copying schema definitions into `apps/api` or `apps/web`
- Free-form resource/action strings outside the enums
- Reintroducing a catalog `code` column alongside `(resource, action)`
- Looser antdv `max`/`min` than Zod
- Putting Vue/antdv imports into this package
