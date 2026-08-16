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

## Build

After editing schemas, rebuild before the API consumes `dist/` (web aliases source in Vite):

```bash
pnpm --filter @maghami-system/schemas build
```

`pnpm dev` / `pnpm dev:api` build this package first. A missing `packages/schemas/dist` is `TS2307: Cannot find module '@maghami-system/schemas'`.

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

- `PermissionResource` — `users` | `roles` | `permissions` | `products` | `product-categories` | `product-brands` | `product-units` | `product-attributes` | `product-code-patterns`
- `PermissionAction` — `read` | `create` | `update` | `delete` (`write` is not an alias)
- Catalog row: `{ resource, action, name }` with **unique `(resource, action)`** (no separate `code` column)
- Bootstrap seeds `SEEDED_PERMISSION_RESOURCES` (RBAC + Product Coding subjects)
- Session `abilities` use `AbilityAction` / `AbilitySubject` (catalog enums + `manage`/`all` for super-admin)
- Session `permissionCodes` are derived display keys (`resource:action`, plus `*` for super-admin)

### Product Coding contracts

| File | DTOs |
|------|------|
| `product-category.ts` | `createProductCategorySchema` / `updateProductCategorySchema` |
| `product-brand.ts` | brand create/update |
| `product-unit.ts` | unit create/update |
| `product-attribute.ts` | attribute create/update (`TEXT` \| `NUMBER` \| `SELECT` \| `BOOLEAN`; SELECT needs `options`) |
| `product-code-pattern.ts` | SKU pattern per category |
| `product.ts` | product create/update (`sku` optional → auto), `productListQuerySchema` (`q`, filters) |

Wire shapes: `ProductCategory`, `ProductBrand`, `ProductUnit`, `ProductAttribute`, `ProductCodePattern`, `Product` (+ `attributeValues`) in `entities.ts`.

Self-service profile (`PATCH /auth/me`): `updateProfileSchema` / `UpdateProfileDto` — name, email, optional password. Not `users:update`; cannot change roles or `isActive`.

Auth tokens: `LoginResult` is session + `accessToken` + `tokenType` only. Refresh token is an HttpOnly cookie (API), not part of the shared JSON contract.

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
