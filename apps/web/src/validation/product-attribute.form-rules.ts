import type { RuleObject } from 'ant-design-vue/es/form'
import {
  catalogCodeSchema,
  productAttributeTypeSchema,
  type ProductAttributeType,
} from '@maghami-system/schemas'
import { z } from 'zod'
import { zodRule } from './zod-rule'

/** Same max/min as createProductAttributeSchema name (schema uses superRefine, no .shape). */
const nameSchema = z.string().trim().min(1).max(255)

export const productAttributeFormRules: Record<
  'name' | 'code' | 'type' | 'options' | 'isActive',
  RuleObject | RuleObject[]
> = {
  name: [
    { required: true, whitespace: true, message: 'نام الزامی است' },
    zodRule(nameSchema),
  ],
  code: [
    { required: true, whitespace: true, message: 'کد الزامی است' },
    zodRule(catalogCodeSchema),
  ],
  type: [
    { required: true, message: 'نوع الزامی است' },
    zodRule(productAttributeTypeSchema),
  ],
  options: [],
  isActive: [zodRule(z.boolean().optional())],
}

export const PRODUCT_ATTRIBUTE_TYPE_OPTIONS: {
  label: string
  value: ProductAttributeType
}[] = [
  { label: 'متن', value: 'TEXT' },
  { label: 'عدد', value: 'NUMBER' },
  { label: 'انتخابی', value: 'SELECT' },
  { label: 'بله/خیر', value: 'BOOLEAN' },
]
