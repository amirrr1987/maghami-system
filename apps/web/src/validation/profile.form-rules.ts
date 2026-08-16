import type { RuleObject } from 'ant-design-vue/es/form'
import { updateProfileSchema } from '@vue-nestjs-admin-template/schemas'
import { zodRule } from './zod-rule'

export type ProfileFormModel = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export function profileFormRules(
  model: ProfileFormModel,
): Record<keyof ProfileFormModel, RuleObject | RuleObject[]> {
  return {
    name: [
      { required: true, whitespace: true, message: 'نام الزامی است' },
      zodRule(updateProfileSchema.shape.name),
    ],
    email: [
      { required: true, message: 'ایمیل الزامی است' },
      zodRule(updateProfileSchema.shape.email),
    ],
    password: [
      {
        async validator(_rule, value: unknown) {
          if (value === undefined || value === null || value === '') {
            return
          }
          const parsed = await updateProfileSchema.shape.password.safeParseAsync(
            value,
          )
          if (!parsed.success) {
            return Promise.reject(
              parsed.error.issues[0]?.message ?? 'رمز نامعتبر',
            )
          }
        },
      },
    ],
    confirmPassword: [
      {
        async validator() {
          if (!model.password) {
            return
          }
          if (model.password !== model.confirmPassword) {
            return Promise.reject('تکرار رمز با رمز جدید یکی نیست')
          }
        },
      },
    ],
  }
}
