import type { RuleObject } from 'ant-design-vue/es/form'
import { createProductCategorySchema } from '@maghami-system/schemas'
import { zodRule } from './zod-rule'

export const productCategoryFormRules: Record<
  'name' | 'code' | 'description' | 'parentId' | 'isActive',
  RuleObject | RuleObject[]
> = {
  name: [
    { required: true, whitespace: true, message: 'نام الزامی است' },
    zodRule(createProductCategorySchema.shape.name),
  ],
  code: [
    { required: true, whitespace: true, message: 'کد الزامی است' },
    zodRule(createProductCategorySchema.shape.code),
  ],
  description: [zodRule(createProductCategorySchema.shape.description)],
  parentId: [zodRule(createProductCategorySchema.shape.parentId)],
  isActive: [zodRule(createProductCategorySchema.shape.isActive)],
}
