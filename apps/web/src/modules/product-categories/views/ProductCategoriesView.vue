<script setup lang="ts">
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { Can } from '@casl/vue'
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
  Switch,
  Tag,
  Textarea,
  TypographyParagraph,
} from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue/es/form'
import type { TableColumnType } from 'ant-design-vue'
import type { CreateProductCategoryDto, UpdateProductCategoryDto } from '@maghami-system/schemas'
import { PermissionAction, PermissionResource } from '@maghami-system/schemas'
import { computed, reactive, ref, toRefs } from 'vue'
import type { ProductCategory } from '@/api/types'
import ResponsiveTable from '@/components/ResponsiveTable.vue'
import { useAppAbility } from '@/ability'
import { useServerTablePagination } from '@/composables/useServerTablePagination'
import { useProductCategories } from '@/modules/product-categories/queries/use-product-categories'
import { productCategoryFormRules } from '@/modules/product-categories/validation/product-category.form-rules'

const { can } = useAppAbility()
const categoryStore = useProductCategories()
const { page, pageSize, total } = toRefs(categoryStore)

const { pagination, onChange: onTableChange } = useServerTablePagination({
  page,
  pageSize,
  total,
  fetchPage: (query) => categoryStore.fetchPage(query),
})

const open = ref(false)
const editing = ref<ProductCategory | null>(null)
const formRef = ref<FormInstance>()

const model = reactive({
  name: '',
  code: '',
  description: '',
  parentId: undefined as string | undefined,
  isActive: true,
})

const parentOptions = computed(() =>
  categoryStore.categoryList
    .filter((row) => row.id !== editing.value?.id)
    .map((row) => ({ label: `${row.name} (${row.code})`, value: row.id })),
)

const columns: TableColumnType<ProductCategory>[] = [
  { title: 'نام', dataIndex: 'name', key: 'name' },
  { title: 'کد', dataIndex: 'code', key: 'code' },
  { title: 'والد', key: 'parentId' },
  { title: 'وضعیت', key: 'isActive', width: 100 },
  { title: 'عملیات', key: 'actions', width: 180 },
]

function resetModel(): void {
  model.name = ''
  model.code = ''
  model.description = ''
  model.parentId = undefined
  model.isActive = true
}

function openCreate(): void {
  if (!can(PermissionAction.Create, PermissionResource.ProductCategories)) return
  editing.value = null
  resetModel()
  open.value = true
}

function openEdit(row: ProductCategory): void {
  if (!can(PermissionAction.Update, PermissionResource.ProductCategories)) return
  editing.value = row
  model.name = row.name
  model.code = row.code
  model.description = row.description ?? ''
  model.parentId = row.parentId ?? undefined
  model.isActive = row.isActive
  open.value = true
}

async function onSubmit(): Promise<void> {
  try {
    await formRef.value?.validate()
  } catch {
    return Promise.reject(new Error('validation'))
  }

  const description = model.description.trim() !== '' ? model.description.trim() : null
  const parentId = model.parentId ?? null

  if (editing.value) {
    const dto: UpdateProductCategoryDto = {
      name: model.name,
      code: model.code,
      description,
      parentId,
      isActive: model.isActive,
    }
    const ok = await categoryStore.update(editing.value.id, dto)
    if (!ok) return Promise.reject(new Error('save'))
    open.value = false
    return
  }

  const dto: CreateProductCategoryDto = {
    name: model.name,
    code: model.code,
    description,
    parentId,
    isActive: model.isActive,
  }
  const ok = await categoryStore.create(dto)
  if (!ok) return Promise.reject(new Error('save'))
  open.value = false
}

async function removeRow(row: ProductCategory): Promise<void> {
  if (!can(PermissionAction.Delete, PermissionResource.ProductCategories)) return
  await categoryStore.remove(row.id)
}

function asRow(record: unknown): ProductCategory {
  return record as ProductCategory
}

function parentLabel(parentId: string | null): string {
  if (!parentId) return '—'
  const parent = categoryStore.categoryList.find((row) => row.id === parentId)
  return parent ? parent.name : parentId
}
</script>

<template>
  <Card title="دسته‌بندی کالا">
    <template #extra>
      <Can :I="PermissionAction.Create" :a="PermissionResource.ProductCategories">
        <Button type="primary" @click="openCreate">
          <template #icon>
            <PlusOutlined />
          </template>
          دسته‌بندی جدید
        </Button>
      </Can>
    </template>

    <TypographyParagraph type="secondary">
      دسته‌بندی سلسله‌مراتبی برای سیستم کدینگ کالا
    </TypographyParagraph>

    <Can :I="PermissionAction.Read" :a="PermissionResource.ProductCategories">
      <ResponsiveTable
        row-key="id"
        size="middle"
        :columns="columns"
        :data-source="categoryStore.categoryList"
        :loading="categoryStore.loading"
        :pagination="pagination"
        @change="onTableChange"
      >
        <template #bodyCell="{ column, record, text }">
          <template v-if="column.key === 'parentId'">
            {{ parentLabel(asRow(record).parentId) }}
          </template>
          <template v-else-if="column.key === 'isActive'">
            <Tag :color="asRow(record).isActive ? 'success' : 'default'">
              {{ asRow(record).isActive ? 'فعال' : 'غیرفعال' }}
            </Tag>
          </template>
          <template v-else-if="column.key === 'actions'">
            <Space>
              <Can :I="PermissionAction.Update" :a="PermissionResource.ProductCategories">
                <Button type="link" @click="openEdit(asRow(record))">
                  <template #icon>
                    <EditOutlined />
                  </template>
                  ویرایش
                </Button>
              </Can>
              <Can :I="PermissionAction.Delete" :a="PermissionResource.ProductCategories">
                <Popconfirm
                  title="حذف دسته‌بندی"
                  :description="`«${asRow(record).name}» حذف شود؟`"
                  ok-text="حذف"
                  ok-type="danger"
                  cancel-text="انصراف"
                  @confirm="removeRow(asRow(record))"
                >
                  <Button type="link" danger>
                    <template #icon>
                      <DeleteOutlined />
                    </template>
                    حذف
                  </Button>
                </Popconfirm>
              </Can>
            </Space>
          </template>
          <template v-else>{{ text }}</template>
        </template>
      </ResponsiveTable>
    </Can>

    <Modal
      v-if="
        can(PermissionAction.Create, PermissionResource.ProductCategories) ||
        can(PermissionAction.Update, PermissionResource.ProductCategories)
      "
      v-model:open="open"
      :title="editing ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'"
      :confirm-loading="categoryStore.saving"
      destroy-on-close
      ok-text="ذخیره"
      cancel-text="انصراف"
      @ok="onSubmit"
    >
      <Form ref="formRef" layout="vertical" :model="model" :rules="productCategoryFormRules">
        <FormItem label="نام" name="name">
          <Input v-model:value="model.name" allow-clear />
        </FormItem>
        <FormItem label="کد" name="code">
          <Input v-model:value="model.code" allow-clear />
        </FormItem>
        <FormItem label="والد" name="parentId">
          <Select
            v-model:value="model.parentId"
            allow-clear
            show-search
            option-filter-prop="label"
            :options="parentOptions"
            placeholder="بدون والد"
          />
        </FormItem>
        <FormItem label="توضیح" name="description">
          <Textarea v-model:value="model.description" :rows="3" allow-clear />
        </FormItem>
        <FormItem label="فعال" name="isActive">
          <Switch v-model:checked="model.isActive" />
        </FormItem>
      </Form>
    </Modal>
  </Card>
</template>
