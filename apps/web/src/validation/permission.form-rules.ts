import type { RuleObject } from 'ant-design-vue/es/form'
import { createPermissionSchema } from '@vue-nestjs-admin-template/schemas'
import { zodRule } from './zod-rule'

export const createPermissionFormRules: Record<
  'resource' | 'action' | 'name' | 'description',
  RuleObject | RuleObject[]
> = {
  resource: [
    { required: true, message: 'منبع الزامی است' },
    zodRule(createPermissionSchema.shape.resource),
  ],
  action: [
    { required: true, message: 'عمل الزامی است' },
    zodRule(createPermissionSchema.shape.action),
  ],
  name: [
    { required: true, whitespace: true, message: 'نام الزامی است' },
    zodRule(createPermissionSchema.shape.name),
  ],
  description: [zodRule(createPermissionSchema.shape.description)],
}

export const updatePermissionFormRules = createPermissionFormRules
