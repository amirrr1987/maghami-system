import type { RuleObject } from 'ant-design-vue/es/form'
import { updateFileFolderSchema, updateFileMetaSchema } from '@maghami-system/schemas'
import { zodRule } from '@/validation/zod-rule'

export const fileFolderFormRules: Record<'name', RuleObject | RuleObject[]> = {
  name: [
    { required: true, whitespace: true, message: 'نام پوشه الزامی است' },
    zodRule(updateFileFolderSchema.shape.name),
  ],
}

export const fileMetaFormRules: Record<'title' | 'alt', RuleObject | RuleObject[]> = {
  title: [
    { required: true, whitespace: true, message: 'عنوان الزامی است' },
    zodRule(updateFileMetaSchema.shape.title),
  ],
  alt: [zodRule(updateFileMetaSchema.shape.alt)],
}
