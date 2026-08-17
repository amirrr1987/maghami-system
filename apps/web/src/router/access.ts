import type { AbilityRule } from '@maghami-system/schemas'
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router'
import { ability } from '@/ability'

export const APP_ROUTE_NAMES = ['users', 'roles', 'permissions', 'files'] as const

export type AppRouteName = (typeof APP_ROUTE_NAMES)[number]

/** Route is allowed when `meta.ability` matches session CASL rules. */
export function routeAllowed(meta: { ability?: AbilityRule }): boolean {
  if (meta.ability) {
    return ability.can(meta.ability.action, meta.ability.subject)
  }
  return true
}

export function firstAllowedRouteName(router: Router): AppRouteName | undefined {
  return APP_ROUTE_NAMES.find((name) => {
    const route = router.getRoutes().find((r) => r.name === name)
    return route ? routeAllowed(route.meta) : false
  })
}

/** Prefer `?redirect=` when it points at an allowed app route. */
export function resolvePostLoginLocation(
  router: Router,
  current: RouteLocationNormalizedLoaded,
): { name: AppRouteName } | { path: string } {
  const redirect = current.query.redirect
  if (typeof redirect === 'string' && redirect.startsWith('/')) {
    const resolved = router.resolve(redirect)
    if (resolved.name && routeAllowed(resolved.meta)) {
      return { path: redirect }
    }
  }
  const home = firstAllowedRouteName(router)
  if (!home) {
    throw new Error('NO_ACCESS')
  }
  return { name: home }
}
