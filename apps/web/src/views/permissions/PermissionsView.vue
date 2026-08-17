<script setup lang="ts">
import {
  DeleteOutlined,
  EditOutlined,
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
  Textarea,
  TypographyParagraph,
  TypographyText,
} from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue/es/form'
import type { TableColumnType } from 'ant-design-vue'
import {
  PermissionAction,
  PermissionResource,
  type CreatePermissionDto,
  type UpdatePermissionDto,
} from '@maghami-system/schemas'
import { reactive, ref, toRefs } from 'vue'
import type { Permission } from '@/api/types'
import { useAppAbility } from '@/ability'
import { useServerTablePagination } from '@/composables/useServerTablePagination'
import { usePermissions } from '@/queries/use-permissions'
import {
  permissionActionOptions,
  permissionResourceOptions,
} from '@/utils/select-options'
import { createPermissionFormRules } from '@/validation/permission.form-rules'

const { can } = useAppAbility()
const permissionStore = usePermissions()
const { page, pageSize, total } = toRefs(permissionStore)

const { pagination, onChange: onTableChange } = useServerTablePagination({
  page,
  pageSize,
  total,
  fetchPage: (query) => permissionStore.fetchPage(query),
})

const open = ref(false)
const editing = ref<Permission | null>(null)
const formRef = ref<FormInstance>()

interface PermissionFormModel {
  resource: PermissionResource | undefined
  action: PermissionAction | undefined
  name: string
  description: string | null
}

const model = reactive<PermissionFormModel>({
  resource: undefined,
  action: undefined,
  name: '',
  description: null,
})

const columns: TableColumnType<Permission>[] = [
  { title: 'منبع', dataIndex: 'resource', key: 'resource' },
  { title: 'عمل', dataIndex: 'action', key: 'action' },
  { title: 'نام', dataIndex: 'name', key: 'name' },
  { title: 'توضیح', dataIndex: 'description', key: 'description' },
  { title: 'عملیات', key: 'actions', width: 180 },
]

function resetModel(): void {
  model.resource = undefined
  model.action = undefined
  model.name = ''
  model.description = null
}

function openCreate(): void {
  editing.value = null
  resetModel()
  open.value = true
}

function openEdit(permission: Permission): void {
  editing.value = permission
  model.resource = permission.resource
  model.action = permission.action
  model.name = permission.name
  model.description = permission.description
  open.value = true
}

async function onSubmit(): Promise<void> {
  try {
    await formRef.value?.validate()
  } catch {
    return Promise.reject(new Error('validation'))
  }

  if (model.resource === undefined || model.action === undefined) {
    return Promise.reject(new Error('validation'))
  }

  const description =
    model.description && model.description.trim()
      ? model.description.trim()
      : null

  if (editing.value) {
    const dto: UpdatePermissionDto = {
      resource: model.resource,
      action: model.action,
      name: model.name,
      description,
    }
    const ok = await permissionStore.update(editing.value.id, dto)
    if (!ok) return Promise.reject(new Error('save'))
    open.value = false
    return
  }

  const dto: CreatePermissionDto = {
    resource: model.resource,
    action: model.action,
    name: model.name,
    description,
  }
  const ok = await permissionStore.create(dto)
  if (!ok) return Promise.reject(new Error('save'))
  open.value = false
}

async function removePermission(permission: Permission): Promise<void> {
  await permissionStore.remove(permission.id)
}

function asPermission(record: unknown): Permission {
  return record as Permission
}
</script>

<template>
  <Card title="مجوزها">
    <template #extra>
      <Button
        v-if="can(PermissionAction.Create, PermissionResource.Permissions)"
        type="primary"
        @click="openCreate"
      >
        <template #icon>
          <PlusOutlined />
        </template>
        مجوز جدید
      </Button>
    </template>

    <TypographyParagraph type="secondary">
      کاتالوگ مجوزها — هر جفت منبع + عمل یکتا است
    </TypographyParagraph>

    <Table
      row-key="id"
      size="middle"
      :columns="columns"
      :data-source="permissionStore.permissionList"
      :loading="permissionStore.loading"
      :pagination="pagination"
      @change="onTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'description'">
          <TypographyText>
            {{ asPermission(record).description || '—' }}
          </TypographyText>
        </template>
        <template v-else-if="column.key === 'actions'">
          <Space>
            <Button
              v-if="can(PermissionAction.Update, PermissionResource.Permissions)"
              type="link"
              @click="openEdit(asPermission(record))"
            >
              <template #icon>
                <EditOutlined />
              </template>
              ویرایش
            </Button>
            <Popconfirm
              v-if="can(PermissionAction.Delete, PermissionResource.Permissions)"
              title="حذف مجوز"
              :description="`مجوز «${asPermission(record).resource}:${asPermission(record).action}» حذف شود؟`"
              ok-text="حذف"
              ok-type="danger"
              cancel-text="انصراف"
              @confirm="removePermission(asPermission(record))"
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
      :title="editing ? 'ویرایش مجوز' : 'مجوز جدید'"
      :confirm-loading="permissionStore.saving"
      destroy-on-close
      ok-text="ذخیره"
      cancel-text="انصراف"
      @ok="onSubmit"
    >
      <Form
        ref="formRef"
        layout="vertical"
        :model="model"
        :rules="createPermissionFormRules"
      >
        <FormItem label="منبع" name="resource">
          <Select
            v-model:value="model.resource"
            :options="permissionResourceOptions"
            placeholder="انتخاب منبع"
            allow-clear
          />
        </FormItem>
        <FormItem label="عمل" name="action">
          <Select
            v-model:value="model.action"
            :options="permissionActionOptions"
            placeholder="انتخاب عمل"
            allow-clear
          />
        </FormItem>
        <FormItem label="نام" name="name">
          <Input v-model:value="model.name" allow-clear />
        </FormItem>
        <FormItem label="توضیح" name="description">
          <Textarea
            :value="model.description ?? ''"
            :rows="3"
            allow-clear
            @update:value="(v: string) => (model.description = v || null)"
          />
        </FormItem>
      </Form>
    </Modal>
  </Card>
</template>
