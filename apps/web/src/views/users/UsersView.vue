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
  InputPassword,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  TypographyParagraph,
  TypographyText,
} from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue/es/form'
import type { TableColumnType } from 'ant-design-vue'
import type { CreateUserDto, UpdateUserDto } from '@vue-nestjs-admin-template/schemas'
import {
  PermissionAction,
  PermissionResource,
} from '@vue-nestjs-admin-template/schemas'
import { computed, onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import type { PublicUser } from '@/api/types'
import { useAppAbility } from '@/ability'
import { useServerTablePagination } from '@/composables/useServerTablePagination'
import { useAuthStore } from '@/stores/auth.store'
import { useRoleStore } from '@/stores/role.store'
import { useUserStore } from '@/stores/user.store'
import {
  createUserFormRules,
  updateUserFormRules,
  type UserFormModel,
} from '@/validation/user.form-rules'

const auth = useAuthStore()
const { can } = useAppAbility()
const userStore = useUserStore()
const roleStore = useRoleStore()
const { page, pageSize, total } = storeToRefs(userStore)

const { pagination, onChange: onTableChange } = useServerTablePagination({
  page,
  pageSize,
  total,
  fetchPage: (query) => userStore.fetchPage(query),
})

const open = ref(false)
const editing = ref<PublicUser | null>(null)
const formRef = ref<FormInstance>()
const togglingId = ref<PublicUser['id'] | null>(null)

const model = reactive<UserFormModel>({
  email: '',
  name: '',
  password: '',
  confirmPassword: '',
  roleIds: [],
})

const rules = computed(() =>
  editing.value ? updateUserFormRules(model) : createUserFormRules(model),
)

const columns: TableColumnType<PublicUser>[] = [
  { title: 'نام', dataIndex: 'name', key: 'name' },
  { title: 'ایمیل', dataIndex: 'email', key: 'email' },
  { title: 'نقش‌ها', key: 'roles' },
  { title: 'وضعیت', key: 'isActive', width: 120 },
  { title: 'عملیات', key: 'actions', width: 180 },
]

function resetModel(): void {
  model.email = ''
  model.name = ''
  model.password = ''
  model.confirmPassword = ''
  model.roleIds = []
}

function openCreate(): void {
  editing.value = null
  resetModel()
  open.value = true
}

function openEdit(user: PublicUser): void {
  if (auth.isSelf(user.id)) return
  editing.value = user
  model.email = ''
  model.name = user.name
  model.password = ''
  model.confirmPassword = ''
  model.roleIds = user.roles.map((r) => r.value)
  open.value = true
}

async function onSubmit(): Promise<void> {
  try {
    await formRef.value?.validate()
  } catch {
    return Promise.reject(new Error('validation'))
  }

  if (editing.value) {
    if (auth.isSelf(editing.value.id)) {
      return Promise.reject(new Error('self'))
    }
    const dto: UpdateUserDto = {
      name: model.name,
      roleIds: model.roleIds,
    }
    if (model.password.trim()) {
      dto.password = model.password
    }
    const ok = await userStore.update(editing.value.id, dto)
    if (!ok) return Promise.reject(new Error('save'))
    open.value = false
    return
  }

  const dto: CreateUserDto = {
    email: model.email,
    name: model.name,
    password: model.password,
    isActive: true,
    roleIds: model.roleIds,
  }
  const ok = await userStore.create(dto)
  if (!ok) return Promise.reject(new Error('save'))
  open.value = false
}

async function onToggleActive(
  user: PublicUser,
  checked: boolean | string | number,
): Promise<void> {
  const next = Boolean(checked)
  if (auth.isSelf(user.id) || !can(PermissionAction.Update, PermissionResource.Users)) return
  if (user.isActive === next) return

  togglingId.value = user.id
  try {
    await userStore.update(user.id, { isActive: next })
  } finally {
    togglingId.value = null
  }
}

async function removeUser(user: PublicUser): Promise<void> {
  if (auth.isSelf(user.id)) return
  await userStore.remove(user.id)
}

function asUser(record: unknown): PublicUser {
  return record as PublicUser
}

function canToggleActive(user: PublicUser): boolean {
  return (
    can(PermissionAction.Update, PermissionResource.Users) &&
    !auth.isSelf(user.id)
  )
}

onMounted(async () => {
  await Promise.all([userStore.fetchPage(), roleStore.fetchOptions()])
})
</script>

<template>
  <Card title="کاربران">
    <template #extra>
      <Button
        v-if="can(PermissionAction.Create, PermissionResource.Users)"
        type="primary"
        @click="openCreate"
      >
        <template #icon>
          <PlusOutlined />
        </template>
        کاربر جدید
      </Button>
    </template>

    <TypographyParagraph type="secondary">
      مدیریت کاربران و تخصیص نقش (RBAC)
    </TypographyParagraph>

    <Table
      row-key="id"
      size="middle"
      :columns="columns"
      :data-source="userStore.userList"
      :loading="userStore.loading"
      :pagination="pagination"
      @change="onTableChange"
    >
      <template #bodyCell="{ column, record }">

        <template v-if="column.key === 'roles'">
          <Space wrap>
            <Tag v-for="role in asUser(record).roles" :key="role.value">
              {{ role.label }}
            </Tag>
            <TypographyText
              v-if="asUser(record).roles.length === 0"
              type="secondary"
            >
              —
            </TypographyText>
          </Space>
        </template>
        <template v-else-if="column.key === 'isActive'">
          <Switch
            :checked="asUser(record).isActive"
            :disabled="!canToggleActive(asUser(record))"
            :loading="togglingId === asUser(record).id"
            checked-children="فعال"
            un-checked-children="غیرفعال"
            @change="(checked) => onToggleActive(asUser(record), checked)"
          />
        </template>
        <template v-else-if="column.key === 'actions'">
          <Space v-if="!auth.isSelf(asUser(record).id)">
            <Button
              v-if="can(PermissionAction.Update, PermissionResource.Users)"
              type="link"
              @click="openEdit(asUser(record))"
            >
              <template #icon>
                <EditOutlined />
              </template>
              ویرایش
            </Button>
            <Popconfirm
              v-if="can(PermissionAction.Delete, PermissionResource.Users)"
              title="حذف کاربر"
              :description="`کاربر «${asUser(record).name}» حذف شود؟`"
              ok-text="حذف"
              ok-type="danger"
              cancel-text="انصراف"
              @confirm="removeUser(asUser(record))"
            >
              <Button type="link" danger>
                <template #icon>
                  <DeleteOutlined />
                </template>
                حذف
              </Button>
            </Popconfirm>
          </Space>
          <TypographyText v-else type="secondary">شما</TypographyText>
        </template>
      </template>
    </Table>

    <Modal
      v-model:open="open"
      :title="editing ? 'ویرایش کاربر' : 'کاربر جدید'"
      :confirm-loading="userStore.saving"
      destroy-on-close
      ok-text="ذخیره"
      cancel-text="انصراف"
      @ok="onSubmit"
    >
      <Form
        ref="formRef"
        layout="vertical"
        :model="model"
        :rules="rules"
      >
        <FormItem label="نام" name="name">
          <Input v-model:value="model.name" allow-clear />
        </FormItem>
        <FormItem v-if="!editing" label="ایمیل" name="email">
          <Input v-model:value="model.email" autocomplete="off" allow-clear />
        </FormItem>
        <FormItem
          :label="editing ? 'رمز عبور (اختیاری)' : 'رمز عبور'"
          name="password"
        >
          <InputPassword
            v-model:value="model.password"
            autocomplete="new-password"
          />
        </FormItem>
        <FormItem label="تکرار رمز عبور" name="confirmPassword">
          <InputPassword
            v-model:value="model.confirmPassword"
            autocomplete="new-password"
          />
        </FormItem>
        <FormItem label="نقش‌ها" name="roleIds">
          <Select
            v-model:value="model.roleIds"
            mode="multiple"
            allow-clear
            show-search
            option-filter-prop="label"
            max-tag-count="responsive"
            :options="roleStore.roleOptions"
            placeholder="انتخاب نقش"
          />
        </FormItem>
      </Form>
    </Modal>
  </Card>
</template>
