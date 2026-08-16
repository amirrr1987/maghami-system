import type { RuleObject } from 'ant-design-vue/es/form'
import { createRoleSchema, SUPER_ADMIN_ROLE_VALUE } from '@maghami-system/schemas'
import { zodRule } from './zod-rule'

/**
 * Form rules for create/edit role. Shared Zod enforces API limits;
 * leading rules are UX-only and must not contradict `@maghami-system/schemas`.
 */
export const createRoleFormRules: Record<
  'label' | 'value' | 'description' | 'permissionIds',
  RuleObject | RuleObject[]
> = {
  label: [
    { required: true, whitespace: true, message: 'عنوان نقش الزامی است' },
    zodRule(createRoleSchema.shape.label),
  ],
  value: [
    { required: true, whitespace: true, message: 'مقدار یکتای نقش الزامی است' },
    zodRule(createRoleSchema.shape.value),
    {
      async validator(_rule, value: unknown) {
        if (value === SUPER_ADMIN_ROLE_VALUE) {
          return Promise.reject(
            new Error('این مقدار برای نقش سیستمی رزرو شده است'),
          )
        }
      },
    },
  ],
  description: [zodRule(createRoleSchema.shape.description)],
  permissionIds: [zodRule(createRoleSchema.shape.permissionIds)],
}

export const updateRoleFormRules = createRoleFormRules
