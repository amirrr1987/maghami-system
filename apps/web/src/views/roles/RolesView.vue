<script setup lang="ts">
import {
  DeleteOutlined,
  EditOutlined,
  LockOutlined,
  PlusOutlined,
} from '@ant-design/icons-vue'
import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Textarea,
  TypographyParagraph,
  TypographyText,
} from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue/es/form'
import type { TableColumnType } from 'ant-design-vue'
import {
  isSuperAdminRoleValue,
  PermissionAction,
  PermissionResource,
  type CreateRoleDto,
  type UpdateRoleDto,
} from '@vue-nestjs-admin-template/schemas'
import { onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import type { Role } from '@/api/types'
import { useAppAbility } from '@/ability'
import { useServerTablePagination } from '@/composables/useServerTablePagination'
import { usePermissionStore } from '@/stores/permission.store'
import { useRoleStore } from '@/stores/role.store'
import { createRoleFormRules } from '@/validation/role.form-rules'

const { can } = useAppAbility()
const roleStore = useRoleStore()
const permissionStore = usePermissionStore()
const { page, pageSize, total } = storeToRefs(roleStore)

const { pagination, onChange: onTableChange } = useServerTablePagination({
  page,
  pageSize,
  total,
  fetchPage: (query) => roleStore.fetchPage(query),
})

const open = ref(false)
const editing = ref<Role | null>(null)
const formRef = ref<FormInstance>()

interface RoleFormModel {
  label: string
  value: string
  description: string | null
  permissionIds: string[]
}

const model = reactive<RoleFormModel>({
  label: '',
  value: '',
  description: null,
  permissionIds: [],
})

const columns: TableColumnType<Role>[] = [
  { title: 'عنوان', dataIndex: 'label', key: 'label' },
  { title: 'مقدار', dataIndex: 'value', key: 'value' },
  { title: 'توضیح', dataIndex: 'description', key: 'description' },
  { title: 'مجوزها', key: 'permissions' },
  { title: 'عملیات', key: 'actions', width: 180 },
]

function resetModel(): void {
  model.label = ''
  model.value = ''
  model.description = null
  model.permissionIds = []
}

function openCreate(): void {
  editing.value = null
  resetModel()
  open.value = true
}

function openEdit(role: Role): void {
  if (isSuperAdminRoleValue(role.value)) return
  editing.value = role
  model.label = role.label
  model.value = role.value
  model.description = role.description
  model.permissionIds = role.permissions.map((p) => p.value)
  open.value = true
}

async function onSubmit(): Promise<void> {
  try {
    await formRef.value?.validate()
  } catch {
    return Promise.reject(new Error('validation'))
  }

  const description =
    model.description && model.description.trim()
      ? model.description.trim()
      : null

  if (editing.value) {
    const dto: UpdateRoleDto = {
      label: model.label,
      value: model.value,
      description,
      permissionIds: model.permissionIds,
    }
    const ok = await roleStore.update(editing.value.value, dto)
    if (!ok) return Promise.reject(new Error('save'))
    open.value = false
    return
  }

  const dto: CreateRoleDto = {
    label: model.label,
    value: model.value,
    description,
    permissionIds: model.permissionIds,
  }
  const ok = await roleStore.create(dto)
  if (!ok) return Promise.reject(new Error('save'))
  open.value = false
}

async function removeRole(role: Role): Promise<void> {
  if (isSuperAdminRoleValue(role.value)) return
  await roleStore.remove(role.value)
}

function asRole(record: unknown): Role {
  return record as Role
}

onMounted(async () => {
  await Promise.all([roleStore.fetchPage(), permissionStore.fetchOptions()])
})
</script>

<template>
  <Card title="نقش‌ها">
    <template #extra>
      <Button
        v-if="can(PermissionAction.Create, PermissionResource.Roles)"
        type="primary"
        @click="openCreate"
      >
        <template #icon>
          <PlusOutlined />
        </template>
        نقش جدید
      </Button>
    </template>

    <TypographyParagraph type="secondary">
      نقش‌ها مجوزها را نگه می‌دارند؛ نقش سیستمی super-admin جدا است و همه دسترسی را دارد
    </TypographyParagraph>

    <Table
      row-key="value"
      size="middle"
      :columns="columns"
      :data-source="roleStore.roleList"
      :loading="roleStore.loading"
      :pagination="pagination"
      @change="onTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'description'">
          <TypographyText>
            {{ asRole(record).description || '—' }}
          </TypographyText>
        </template>
        <template v-else-if="column.key === 'permissions'">
          <Tag v-if="isSuperAdminRoleValue(asRole(record).value)" color="gold">
            همه دسترسی‌ها
          </Tag>
          <Space v-else wrap>
            <Tag
              v-for="permission in asRole(record).permissions"
              :key="permission.value"
            >
              {{ permission.label }}
            </Tag>
            <TypographyText
              v-if="asRole(record).permissions.length === 0"
              type="secondary"
            >
              —
            </TypographyText>
          </Space>
        </template>
        <template v-else-if="column.key === 'actions'">
          <TypographyText
            v-if="isSuperAdminRoleValue(asRole(record).value)"
            type="secondary"
          >
            <LockOutlined /> سیستمی
          </TypographyText>
          <Space v-else>
            <Button
              v-if="can(PermissionAction.Update, PermissionResource.Roles)"
              type="link"
              @click="openEdit(asRole(record))"
            >
              <template #icon>
                <EditOutlined />
              </template>
              ویرایش
            </Button>
            <Popconfirm
              v-if="can(PermissionAction.Delete, PermissionResource.Roles)"
              title="حذف نقش"
              :description="`نقش «${asRole(record).label}» حذف شود؟`"
              ok-text="حذف"
              ok-type="danger"
              cancel-text="انصراف"
              @confirm="removeRole(asRole(record))"
            >
              <Button type="link" danger>
                <template #icon>
                  <DeleteOutlined />
                </template>
                حذف
              </Button>
            </Popconfirm>
          </Space>
        </template>
      </template>
    </Table>

    <Modal
      v-model:open="open"
      :title="editing ? 'ویرایش نقش' : 'نقش جدید'"
      :confirm-loading="roleStore.saving"
      destroy-on-close
      ok-text="ذخیره"
      cancel-text="انصراف"
      @ok="onSubmit"
    >
      <Form
        ref="formRef"
        layout="vertical"
        :model="model"
        :rules="createRoleFormRules"
      >
        <FormItem label="عنوان" name="label">
          <Input
            v-model:value="model.label"
            allow-clear
            placeholder="مثلاً مدیر کل"
          />
        </FormItem>
        <FormItem label="مقدار یکتا" name="value">
          <Input
            v-model:value="model.value"
            allow-clear
            placeholder="مثلاً editor"
          />
        </FormItem>
        <FormItem label="توضیح" name="description">
          <Textarea
            :value="model.description ?? ''"
            :rows="3"
            allow-clear
            @update:value="(v: string) => (model.description = v || null)"
          />
        </FormItem>
        <FormItem label="مجوزها" name="permissionIds">
          <Select
            v-model:value="model.permissionIds"
            mode="multiple"
            allow-clear
            show-search
            option-filter-prop="label"
            max-tag-count="responsive"
            :options="permissionStore.permissionOptions"
            placeholder="انتخاب مجوز"
          />
        </FormItem>
      </Form>
    </Modal>
  </Card>
</template>
