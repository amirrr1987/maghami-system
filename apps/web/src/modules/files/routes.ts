import { PermissionAction, PermissionResource } from '@maghami-system/schemas'
import type { RouteRecordRaw } from 'vue-router'

export const filesRoutes: RouteRecordRaw[] = [
  {
    path: 'files',
    name: 'files',
    component: () => import('./views/FilesView.vue'),
    meta: {
      title: 'مدیریت فایل‌ها',
      ability: {
        action: PermissionAction.Read,
        subject: PermissionResource.Files,
      },
    },
  },
]
