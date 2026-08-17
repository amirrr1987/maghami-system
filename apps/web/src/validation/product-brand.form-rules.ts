import type { RuleObject } from 'ant-design-vue/es/form'
import { createProductBrandSchema } from '@maghami-system/schemas'
import { zodRule } from './zod-rule'

export const productBrandFormRules: Record<
  'name' | 'code' | 'logoUrl' | 'description' | 'isActive',
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
  logoUrl: [
    {
      async validator(_rule, value: unknown) {
        if (value === undefined || value === null || value === '') return
        const parsed = await createProductBrandSchema.shape.logoUrl.safeParseAsync(value)
        if (parsed.success) return
        return Promise.reject(parsed.error.issues[0]?.message ?? 'آدرس لوگو نامعتبر است')
      },
    },
  ],
  description: [zodRule(createProductBrandSchema.shape.description)],
  isActive: [zodRule(createProductBrandSchema.shape.isActive)],
}
