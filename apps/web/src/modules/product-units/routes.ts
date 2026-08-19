import { PermissionAction, PermissionResource } from '@maghami-system/schemas'
import type { RouteRecordRaw } from 'vue-router'

export const productUnitsRoutes: RouteRecordRaw[] = [
  {
    path: 'product-units',
    name: 'product-units',
    component: () => import('./views/ProductUnitsView.vue'),
    meta: {
      title: 'واحد کالا',
      ability: {
        action: PermissionAction.Read,
        subject: PermissionResource.ProductUnits,
      },
    },
  },
]
