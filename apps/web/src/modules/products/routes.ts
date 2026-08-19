import { PermissionAction, PermissionResource } from '@maghami-system/schemas'
import type { RouteRecordRaw } from 'vue-router'

export const productsRoutes: RouteRecordRaw[] = [
  {
    path: 'products',
    name: 'products',
    component: () => import('./views/ProductsView.vue'),
    meta: {
      title: 'محصولات',
      ability: {
        action: PermissionAction.Read,
        subject: PermissionResource.Products,
      },
    },
  },
]
