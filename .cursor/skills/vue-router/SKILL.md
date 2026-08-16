---
name: vue-router
description: >
  Type-safe Vue Router 5 in apps/web — createRouter, RouteMeta augmentation,
  navigation guards. Use when editing routes, meta.ability, or router guards.
---

# Vue Router (type-safe)

Docs: [router.vuejs.org](https://router.vuejs.org). Version: `vue-router` **^5** in `apps/web`.

## Source of truth

```ts
import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalized,
  type RouteRecordRaw,
  type Router,
} from 'vue-router'
```

Augment `RouteMeta` via module declaration — do not use untyped `meta` bags:

```ts
import type { AbilityRule } from '@vue-nestjs-admin-template/schemas'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    public?: boolean
    requiresAuth?: boolean
    /** Page contract: CASL action + subject (not catalog code). */
    ability?: AbilityRule
  }
}
```

## This repo

- Router: `apps/web/src/router/index.ts`
- Access helpers: `apps/web/src/router/access.ts` + CASL (`casl-vue` skill)
- Lazy views: `() => import('@/views/…')`

```ts
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: 'users',
      name: 'users',
      component: () => import('@/views/users/UsersView.vue'),
      meta: { title: 'کاربران', ability: { action: 'read', subject: 'users' } },
    },
  ],
})
```

## Anti-patterns

- `meta` fields not declared on `RouteMeta`
- Hardcoding redirects that ignore `ability` / CASL
- `as any` on `to` / `from` in guards
