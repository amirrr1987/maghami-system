import type { RuleObject } from 'ant-design-vue/es/form'
import { createProductCodePatternSchema } from '@maghami-system/schemas'
import { zodRule } from '@/validation/zod-rule'

export const productCodePatternFormRules: Record<
  'categoryId' | 'prefix' | 'separator' | 'length' | 'isActive',
  RuleObject | RuleObject[]
> = {
  categoryId: [
    { required: true, message: 'دسته‌بندی الزامی است' },
    zodRule(createProductCodePatternSchema.shape.categoryId),
  ],
  prefix: [
    { required: true, whitespace: true, message: 'پیشوند الزامی است' },
    zodRule(createProductCodePatternSchema.shape.prefix),
  ],
  separator: [zodRule(createProductCodePatternSchema.shape.separator)],
  length: [
    { required: true, message: 'طول الزامی است' },
    zodRule(createProductCodePatternSchema.shape.length),
  ],
  isActive: [zodRule(createProductCodePatternSchema.shape.isActive)],
}
