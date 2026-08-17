import type { LabelValue, Permission } from '@maghami-system/schemas'
import {
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
  PermissionAction,
  PermissionResource,
} from '@maghami-system/schemas'
import type { DefaultOptionType } from 'ant-design-vue/es/select'

/** Map domain rows to antdv Select `:options` (`label` + `value`). */
export function toSelectOptions(items: readonly LabelValue[]): DefaultOptionType[] {
  return items.map((item) => ({
    label: item.label,
    value: item.value,
  }))
}

const RESOURCE_LABELS_FA: Record<PermissionResource, string> = {
  [PermissionResource.Users]: 'کاربران',
  [PermissionResource.Roles]: 'نقش‌ها',
  [PermissionResource.Permissions]: 'مجوزها',
  [PermissionResource.Files]: 'فایل‌ها',
  [PermissionResource.Products]: 'محصولات',
  [PermissionResource.ProductCategories]: 'دسته‌بندی کالا',
  [PermissionResource.ProductBrands]: 'برند کالا',
  [PermissionResource.ProductUnits]: 'واحد کالا',
  [PermissionResource.ProductAttributes]: 'ویژگی کالا',
  [PermissionResource.ProductCodePatterns]: 'الگوی کدینگ کالا',
}

const ACTION_LABELS_FA: Record<PermissionAction, string> = {
  [PermissionAction.Read]: 'خواندن',
  [PermissionAction.Create]: 'ایجاد',
  [PermissionAction.Update]: 'ویرایش',
  [PermissionAction.Delete]: 'حذف',
}

export const permissionResourceOptions: DefaultOptionType[] = PERMISSION_RESOURCES.map((value) => ({
  label: RESOURCE_LABELS_FA[value],
  value,
}))

export const permissionActionOptions: DefaultOptionType[] = PERMISSION_ACTIONS.map((value) => ({
  label: ACTION_LABELS_FA[value],
  value,
}))

export function permissionToOption(permission: Pick<Permission, 'id' | 'name'>): LabelValue {
  return {
    label: permission.name,
    value: permission.id,
  }
}
