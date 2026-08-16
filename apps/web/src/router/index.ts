import {
  PermissionAction,
  PermissionResource,
  type AbilityRule,
} from '@vue-nestjs-admin-template/schemas'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { firstAllowedRouteName, routeAllowed } from './access'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    public?: boolean
    requiresAuth?: boolean
    /** Page contract: CASL action + subject (not catalog code). */
    ability?: AbilityRule
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { title: 'ورود', public: true },
    },
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: { name: 'users' } },
        {
          path: 'users',
          name: 'users',
          component: () => import('@/views/users/UsersView.vue'),
          meta: {
            title: 'کاربران',
            ability: {
              action: PermissionAction.Read,
              subject: PermissionResource.Users,
            },
          },
        },
        {
          path: 'roles',
          name: 'roles',
          component: () => import('@/views/roles/RolesView.vue'),
          meta: {
            title: 'نقش‌ها',
            ability: {
              action: PermissionAction.Read,
              subject: PermissionResource.Roles,
            },
          },
        },
        {
          path: 'permissions',
          name: 'permissions',
          component: () => import('@/views/permissions/PermissionsView.vue'),
          meta: {
            title: 'مجوزها',
            ability: {
              action: PermissionAction.Read,
              subject: PermissionResource.Permissions,
            },
          },
        },
        {
          path: 'products',
          name: 'products',
          component: () => import('@/views/products/ProductsView.vue'),
          meta: {
            title: 'محصولات',
            ability: {
              action: PermissionAction.Read,
              subject: PermissionResource.Products,
            },
          },
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
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

export default router
