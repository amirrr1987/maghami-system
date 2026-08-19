import { PermissionAction, PermissionResource } from '@maghami-system/schemas'
import type { RouteRecordRaw } from 'vue-router'

export const permissionsRoutes: RouteRecordRaw[] = [
  {
    path: 'permissions',
    name: 'permissions',
    component: () => import('./views/PermissionsView.vue'),
    meta: {
      title: 'مجوزها',
      ability: {
        action: PermissionAction.Read,
        subject: PermissionResource.Permissions,
      },
    },
  },
]
