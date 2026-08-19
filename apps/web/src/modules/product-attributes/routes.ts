import { PermissionAction, PermissionResource } from '@maghami-system/schemas'
import type { RouteRecordRaw } from 'vue-router'

export const productAttributesRoutes: RouteRecordRaw[] = [
  {
    path: 'product-attributes',
    name: 'product-attributes',
    component: () => import('./views/ProductAttributesView.vue'),
    meta: {
      title: 'ویژگی کالا',
      ability: {
        action: PermissionAction.Read,
        subject: PermissionResource.ProductAttributes,
      },
    },
  },
]
