---
name: casl-vue
description: >
  Type-safe CASL authorization in Vue 3 with @casl/vue + @casl/ability —
  abilitiesPlugin, useAbility, Can, AbilityBuilder. Use when wiring UI
  permissions, v-if can(), route guards, or dynamic RBAC from permission codes.
---

# @casl/vue + @casl/ability (type-safe)

Docs: [casl.js.org — @casl/vue](https://casl.js.org/v6/en/package/casl-vue).  
Installed in `apps/web`: `@casl/ability` ^6, `@casl/vue` ^2 (Vue 3).

## Source of truth

Use exports from the packages — do not invent parallel ability types:

```ts
import {
  AbilityBuilder,
  createMongoAbility,
  type MongoAbility,
  type CreateAbility,
} from '@casl/ability';
import { abilitiesPlugin, useAbility } from '@casl/vue';
import type { AbilityRule } from '@vue-nestjs-admin-template/schemas';
```

This app wraps them in `apps/web/src/ability/index.ts` (`AppAbility`, `useAppAbility`, `updateAbilityFromRules`).

## This repo pattern (dynamic RBAC)

Authz is **resource + action** from shared enums (not free-form strings).

1. Enums in `@vue-nestjs-admin-template/schemas`: `PermissionResource`, `PermissionAction`
2. Permission row: enum `resource` + enum `action` (unique together) + `name`
3. `/auth/me` returns `abilities: AbilityRule[]` (super-admin → `{ action: 'manage', subject: 'all' }`)
4. `updateAbilityFromRules(abilities)` → CASL `can(action, subject)` with **no** write↔update aliases
5. UI: `can(PermissionAction.Update, PermissionResource.Products)` / `<Can :I="PermissionAction.Update" :a="PermissionResource.Products">`
6. Routes: `meta.ability: { action: PermissionAction.Read, subject: PermissionResource.Products }`
7. API: `@RequireAbility(PermissionAction.Update, PermissionResource.Products)` via `abilityCovers`

A new action or resource requires extending the enums (then seed / UI Select options), not inventing ad-hoc strings.

```ts
import { PermissionAction, PermissionResource } from '@vue-nestjs-admin-template/schemas'

app.use(abilitiesPlugin, ability, { useGlobalProperties: true });

const { can } = useAppAbility();
can(PermissionAction.Read, PermissionResource.Products);
can(PermissionAction.Update, PermissionResource.Products);
can('manage', 'all'); // super-admin

<Can :I="PermissionAction.Create" :a="PermissionResource.Products">…</Can>
```

## Anti-patterns

- Gating UI on `permissionCodes` (display-only derived keys)
- Treating `write` as create+update
- String literals like `can('read', 'users')` — use `PermissionAction` / `PermissionResource`
- Free-form subject/action strings that are not in the shared enums (except `manage`/`all`)
- Using `any` instead of `MongoAbility<[AbilityAction, AbilitySubject]>` / `AppAbility`

## Official docs

- https://casl.js.org/v6/en/package/casl-vue
- https://casl.js.org/v6/en/guide/intro
