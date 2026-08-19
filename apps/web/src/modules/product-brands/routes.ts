import { PermissionAction, PermissionResource } from '@maghami-system/schemas'
import type { RouteRecordRaw } from 'vue-router'

export const productBrandsRoutes: RouteRecordRaw[] = [
  {
    path: 'product-brands',
    name: 'product-brands',
    component: () => import('./views/ProductBrandsView.vue'),
    meta: {
      title: 'برند کالا',
      ability: {
        action: PermissionAction.Read,
        subject: PermissionResource.ProductBrands,
      },
    },
  },
]
