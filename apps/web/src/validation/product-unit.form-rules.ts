import type { RuleObject } from 'ant-design-vue/es/form'
import { createProductUnitSchema } from '@maghami-system/schemas'
import { zodRule } from './zod-rule'

export const productUnitFormRules: Record<
  'name' | 'code' | 'symbol' | 'isActive',
  RuleObject | RuleObject[]
> = {
  name: [
    { required: true, whitespace: true, message: 'نام الزامی است' },
    zodRule(createProductUnitSchema.shape.name),
  ],
  code: [
    { required: true, whitespace: true, message: 'کد الزامی است' },
    zodRule(createProductUnitSchema.shape.code),
  ],
  symbol: [
    { required: true, whitespace: true, message: 'نماد الزامی است' },
    zodRule(createProductUnitSchema.shape.symbol),
  ],
  isActive: [zodRule(createProductUnitSchema.shape.isActive)],
}
