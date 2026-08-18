import type { RuleObject } from 'ant-design-vue/es/form'
import { createProductBrandSchema } from '@maghami-system/schemas'
import { zodRule } from './zod-rule'

export const productBrandFormRules: Record<
  'name' | 'code' | 'logoFileId' | 'description' | 'isActive',
  RuleObject | RuleObject[]
> = {
  name: [
    { required: true, whitespace: true, message: 'نام الزامی است' },
    zodRule(createProductBrandSchema.shape.name),
  ],
  code: [
    { required: true, whitespace: true, message: 'کد الزامی است' },
    zodRule(createProductBrandSchema.shape.code),
  ],
  logoFileId: [zodRule(createProductBrandSchema.shape.logoFileId)],
  description: [zodRule(createProductBrandSchema.shape.description)],
  isActive: [zodRule(createProductBrandSchema.shape.isActive)],
}
