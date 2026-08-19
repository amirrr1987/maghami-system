import { PermissionAction, PermissionResource } from '@maghami-system/schemas'
import type { RouteRecordRaw } from 'vue-router'

export const productCodePatternsRoutes: RouteRecordRaw[] = [
  {
    path: 'product-code-patterns',
    name: 'product-code-patterns',
    component: () => import('./views/ProductCodePatternsView.vue'),
    meta: {
      title: 'الگوی کدینگ',
      ability: {
        action: PermissionAction.Read,
        subject: PermissionResource.ProductCodePatterns,
      },
    },
  },
]
