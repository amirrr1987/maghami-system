import type { RuleObject } from 'ant-design-vue/es/form'
import { createUserSchema, type Role } from '@vue-nestjs-admin-template/schemas'
import { zodRule } from './zod-rule'

export type UserFormModel = {
  email: string
  name: string
  password: string
  confirmPassword: string
  roleIds: Role['value'][]
}

export function createUserFormRules(
  model: UserFormModel,
): Record<keyof UserFormModel, RuleObject | RuleObject[]> {
  return {
    email: [
      { required: true, message: 'ایمیل الزامی است' },
      zodRule(createUserSchema.shape.email),
    ],
    name: [
      { required: true, whitespace: true, message: 'نام الزامی است' },
      zodRule(createUserSchema.shape.name),
    ],
    password: [
      { required: true, message: 'رمز عبور الزامی است' },
      zodRule(createUserSchema.shape.password),
    ],
    confirmPassword: [
      { required: true, message: 'تکرار رمز عبور الزامی است' },
      {
        async validator() {
          if (model.password !== model.confirmPassword) {
            return Promise.reject('تکرار رمز با رمز جدید یکی نیست')
          }
        },
      },
    ],
    roleIds: [zodRule(createUserSchema.shape.roleIds)],
  }
}

export function updateUserFormRules(
  model: UserFormModel,
): Record<
  Exclude<keyof UserFormModel, 'email'>,
  RuleObject | RuleObject[]
> {
  return {
    name: [
      { required: true, whitespace: true, message: 'نام الزامی است' },
      zodRule(createUserSchema.shape.name),
    ],
    password: [
      {
        async validator(_rule, value: unknown) {
          if (value === undefined || value === null || value === '') {
            return
          }
          const parsed = await createUserSchema.shape.password.safeParseAsync(
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
    roleIds: [zodRule(createUserSchema.shape.roleIds)],
  }
}
