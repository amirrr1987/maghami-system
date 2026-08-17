<script setup lang="ts">
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons-vue'
import { Can } from '@casl/vue'
import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Table,
  Tag,
  Textarea,
  TypographyParagraph,
} from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue/es/form'
import type { TableColumnType } from 'ant-design-vue'
import type {
  CreateProductBrandDto,
  UpdateProductBrandDto,
} from '@maghami-system/schemas'
import {
  PermissionAction,
  PermissionResource,
} from '@maghami-system/schemas'
import { reactive, ref, toRefs } from 'vue'
import type { ProductBrand } from '@/api/types'
import { useAppAbility } from '@/ability'
import { useServerTablePagination } from '@/composables/useServerTablePagination'
import { useProductBrands } from '@/queries/use-product-brands'
import { productBrandFormRules } from '@/validation/product-brand.form-rules'

const { can } = useAppAbility()
const brandStore = useProductBrands()
const { page, pageSize, total } = toRefs(brandStore)

const { pagination, onChange: onTableChange } = useServerTablePagination({
  page,
  pageSize,
  total,
  fetchPage: (query) => brandStore.fetchPage(query),
})

const open = ref(false)
const editing = ref<ProductBrand | null>(null)
const formRef = ref<FormInstance>()

const model = reactive({
  name: '',
  code: '',
  logoUrl: '',
  description: '',
  isActive: true,
})

const columns: TableColumnType<ProductBrand>[] = [
  { title: 'نام', dataIndex: 'name', key: 'name' },
  { title: 'کد', dataIndex: 'code', key: 'code' },
  { title: 'وضعیت', key: 'isActive', width: 100 },
  { title: 'عملیات', key: 'actions', width: 180 },
]

function resetModel(): void {
  model.name = ''
  model.code = ''
  model.logoUrl = ''
  model.description = ''
  model.isActive = true
}

function openCreate(): void {
  if (!can(PermissionAction.Create, PermissionResource.ProductBrands)) return
  editing.value = null
  resetModel()
  open.value = true
}

function openEdit(row: ProductBrand): void {
  if (!can(PermissionAction.Update, PermissionResource.ProductBrands)) return
  editing.value = row
  model.name = row.name
  model.code = row.code
  model.logoUrl = row.logoUrl ?? ''
  model.description = row.description ?? ''
  model.isActive = row.isActive
  open.value = true
}

async function onSubmit(): Promise<void> {
  try {
    await formRef.value?.validate()
  } catch {
    return Promise.reject(new Error('validation'))
  }

  const description =
    model.description.trim() !== '' ? model.description.trim() : null
  const logoUrl = model.logoUrl.trim() !== '' ? model.logoUrl.trim() : null

  if (editing.value) {
    const dto: UpdateProductBrandDto = {
      name: model.name,
      code: model.code,
      logoUrl,
      description,
      isActive: model.isActive,
    }
    const ok = await brandStore.update(editing.value.id, dto)
    if (!ok) return Promise.reject(new Error('save'))
    open.value = false
    return
  }

  const dto: CreateProductBrandDto = {
    name: model.name,
    code: model.code,
    logoUrl,
    description,
    isActive: model.isActive,
  }
  const ok = await brandStore.create(dto)
  if (!ok) return Promise.reject(new Error('save'))
  open.value = false
}

async function removeRow(row: ProductBrand): Promise<void> {
  if (!can(PermissionAction.Delete, PermissionResource.ProductBrands)) return
  await brandStore.remove(row.id)
}

function asRow(record: unknown): ProductBrand {
  return record as ProductBrand
}
</script>

<template>
  <Card title="برند کالا">
    <template #extra>
      <Can :I="PermissionAction.Create" :a="PermissionResource.ProductBrands">
        <Button type="primary" @click="openCreate">
          <template #icon>
            <PlusOutlined />
          </template>
          برند جدید
        </Button>
      </Can>
    </template>

    <TypographyParagraph type="secondary">مدیریت برندهای کالا</TypographyParagraph>

    <Can :I="PermissionAction.Read" :a="PermissionResource.ProductBrands">
      <Table
        row-key="id"
        size="middle"
        :columns="columns"
        :data-source="brandStore.brandList"
        :loading="brandStore.loading"
        :pagination="pagination"
        @change="onTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'isActive'">
            <Tag :color="asRow(record).isActive ? 'success' : 'default'">
              {{ asRow(record).isActive ? 'فعال' : 'غیرفعال' }}
            </Tag>
          </template>
          <template v-else-if="column.key === 'actions'">
            <Space>
              <Can
                :I="PermissionAction.Update"
                :a="PermissionResource.ProductBrands"
              >
                <Button type="link" @click="openEdit(asRow(record))">
                  <template #icon>
                    <EditOutlined />
                  </template>
                  ویرایش
                </Button>
              </Can>
              <Can
                :I="PermissionAction.Delete"
                :a="PermissionResource.ProductBrands"
              >
                <Popconfirm
                  title="حذف برند"
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
        </template>
      </Table>
    </Can>

    <Modal
      v-if="
        can(PermissionAction.Create, PermissionResource.ProductBrands) ||
        can(PermissionAction.Update, PermissionResource.ProductBrands)
      "
      v-model:open="open"
      :title="editing ? 'ویرایش برند' : 'برند جدید'"
      :confirm-loading="brandStore.saving"
      destroy-on-close
      ok-text="ذخیره"
      cancel-text="انصراف"
      @ok="onSubmit"
    >
      <Form
        ref="formRef"
        layout="vertical"
        :model="model"
        :rules="productBrandFormRules"
      >
        <FormItem label="نام" name="name">
          <Input v-model:value="model.name" allow-clear />
        </FormItem>
        <FormItem label="کد" name="code">
          <Input v-model:value="model.code" allow-clear />
        </FormItem>
        <FormItem label="آدرس لوگو" name="logoUrl">
          <Input v-model:value="model.logoUrl" allow-clear placeholder="https://…" />
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
