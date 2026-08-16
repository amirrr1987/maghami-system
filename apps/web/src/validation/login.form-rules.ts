import { loginSchema } from '@vue-nestjs-admin-template/schemas'
import type { RuleObject } from 'ant-design-vue/es/form'
import { zodRule } from './zod-rule'

export const loginFormRules: Record<
  'email' | 'password',
  RuleObject | RuleObject[]
> = {
  email: [
    { required: true, message: 'ایمیل الزامی است' },
    zodRule(loginSchema.shape.email),
  ],
  password: [
    { required: true, message: 'رمز عبور الزامی است' },
    zodRule(loginSchema.shape.password),
  ],
}
