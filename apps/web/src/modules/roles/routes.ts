import { PermissionAction, PermissionResource } from '@maghami-system/schemas'
import type { RouteRecordRaw } from 'vue-router'

export const rolesRoutes: RouteRecordRaw[] = [
  {
    path: 'roles',
    name: 'roles',
    component: () => import('./views/RolesView.vue'),
    meta: {
      title: 'نقش‌ها',
      ability: {
        action: PermissionAction.Read,
        subject: PermissionResource.Roles,
      },
    },
  },
]
