import { PermissionAction, PermissionResource } from '@maghami-system/schemas'
import type { RouteRecordRaw } from 'vue-router'

export const productCategoriesRoutes: RouteRecordRaw[] = [
  {
    path: 'product-categories',
    name: 'product-categories',
    component: () => import('./views/ProductCategoriesView.vue'),
    meta: {
      title: 'دسته‌بندی کالا',
      ability: {
        action: PermissionAction.Read,
        subject: PermissionResource.ProductCategories,
      },
    },
  },
]
