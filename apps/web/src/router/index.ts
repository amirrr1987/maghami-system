import NProgress from 'nprogress'
import type { NProgressOptions } from 'nprogress'
import { createRouter, createWebHistory } from 'vue-router'
import type { AbilityRule } from '@maghami-system/schemas'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { authRoutes } from '@/modules/auth/routes'
import { usersRoutes } from '@/modules/users/routes'
import { rolesRoutes } from '@/modules/roles/routes'
import { permissionsRoutes } from '@/modules/permissions/routes'
import { filesRoutes } from '@/modules/files/routes'
import { productsRoutes } from '@/modules/products/routes'
import { productCategoriesRoutes } from '@/modules/product-categories/routes'
import { productBrandsRoutes } from '@/modules/product-brands/routes'
import { productUnitsRoutes } from '@/modules/product-units/routes'
import { productAttributesRoutes } from '@/modules/product-attributes/routes'
import { productCodePatternsRoutes } from '@/modules/product-code-patterns/routes'
import { firstAllowedRouteName, routeAllowed } from './access'
import 'nprogress/nprogress.css'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    public?: boolean
    requiresAuth?: boolean
    /** Page contract: CASL action + subject (not catalog code). */
    ability?: AbilityRule
  }
}

const nprogressOptions: Partial<NProgressOptions> = {
  showSpinner: false,
  trickleSpeed: 200,
}
NProgress.configure(nprogressOptions)

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...authRoutes,
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: { name: 'users' } },
        ...usersRoutes,
        ...rolesRoutes,
        ...permissionsRoutes,
        ...filesRoutes,
        ...productsRoutes,
        ...productCategoriesRoutes,
        ...productBrandsRoutes,
        ...productUnitsRoutes,
        ...productAttributesRoutes,
        ...productCodePatternsRoutes,
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  NProgress.start()
  const auth = useAuthStore()
  if (!auth.bootstrapped) {
    await auth.fetchMe()
  }

  const isPublic = Boolean(to.meta.public)

  if (isPublic) {
    if (to.name === 'login' && auth.isAuthenticated) {
      const home = firstAllowedRouteName(router)
      if (home) return { name: home }
      await auth.logout()
      return {
        name: 'login',
        query: { ...to.query, reason: 'no_access' },
        replace: true,
      }
    }
    return true
  }

  if (!auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (!routeAllowed(to.meta)) {
    const home = firstAllowedRouteName(router)
    if (home) return { name: home }
    await auth.logout()
    return { name: 'login', query: { reason: 'no_access' } }
  }

  return true
})

router.afterEach(() => {
  NProgress.done()
})

router.onError(() => {
  NProgress.done()
})

export default router
