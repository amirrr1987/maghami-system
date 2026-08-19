import { PermissionAction, PermissionResource } from '@maghami-system/schemas'
import type { RouteRecordRaw } from 'vue-router'

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('./views/LoginView.vue'),
    meta: { title: 'ورود', public: true },
  },
]
