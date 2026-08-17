import type { RuleObject } from 'ant-design-vue/es/form'
import { createProductSchema, productSkuSchema } from '@maghami-system/schemas'
import { zodRule } from './zod-rule'

export const createProductFormRules: Record<
  | 'sku'
  | 'name'
  | 'categoryId'
  | 'brandId'
  | 'unitId'
  | 'barcode'
  | 'description'
  | 'price'
  | 'isActive',
  RuleObject | RuleObject[]
> = {
  sku: [
    {
      async validator(_rule, value: unknown) {
        if (value === undefined || value === null || value === '') return
        const parsed = await productSkuSchema.safeParseAsync(value)
        if (parsed.success) return
        return Promise.reject(parsed.error.issues[0]?.message ?? 'SKU نامعتبر')
      },
    },
  ],
  name: [
    { required: true, whitespace: true, message: 'نام الزامی است' },
    zodRule(createProductSchema.shape.name),
  ],
  categoryId: [
    { required: true, message: 'دسته‌بندی الزامی است' },
    zodRule(createProductSchema.shape.categoryId),
  ],
  brandId: [zodRule(createProductSchema.shape.brandId)],
  unitId: [zodRule(createProductSchema.shape.unitId)],
  barcode: [
    {
      async validator(_rule, value: unknown) {
        if (value === undefined || value === null || value === '') return
        const parsed = await createProductSchema.shape.barcode.safeParseAsync(value)
        if (parsed.success) return
        return Promise.reject(parsed.error.issues[0]?.message ?? 'بارکد نامعتبر است')
      },
    },
  ],
  description: [zodRule(createProductSchema.shape.description)],
  price: [zodRule(createProductSchema.shape.price)],
  isActive: [zodRule(createProductSchema.shape.isActive)],
}

export const updateProductFormRules = createProductFormRules
