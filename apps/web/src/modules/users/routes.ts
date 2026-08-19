import { PermissionAction, PermissionResource } from '@maghami-system/schemas'
import type { RouteRecordRaw } from 'vue-router'

export const usersRoutes: RouteRecordRaw[] = [
  {
    path: 'users',
    name: 'users',
    component: () => import('./views/UsersView.vue'),
    meta: {
      title: 'کاربران',
      ability: {
        action: PermissionAction.Read,
        subject: PermissionResource.Users,
      },
    },
  },
]
