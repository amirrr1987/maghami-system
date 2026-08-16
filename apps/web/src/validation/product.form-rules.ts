import type { RuleObject } from 'ant-design-vue/es/form'
import { createProductSchema } from '@maghami-system/schemas'
import { zodRule } from './zod-rule'

export const createProductFormRules: Record<
  'sku' | 'name' | 'description' | 'price' | 'isActive',
  RuleObject | RuleObject[]
> = {
  sku: [
    { required: true, whitespace: true, message: 'کد کالا الزامی است' },
    zodRule(createProductSchema.shape.sku),
  ],
  name: [
    { required: true, whitespace: true, message: 'نام الزامی است' },
    zodRule(createProductSchema.shape.name),
  ],
  description: [zodRule(createProductSchema.shape.description)],
  price: [
    { required: true, message: 'قیمت الزامی است' },
    zodRule(createProductSchema.shape.price),
  ],
  isActive: [zodRule(createProductSchema.shape.isActive)],
}

export const updateProductFormRules = createProductFormRules
