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
  InputNumber,
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
import type { CreateProductDto, UpdateProductDto } from '@maghami-system/schemas'
import {
  PermissionAction,
  PermissionResource,
} from '@maghami-system/schemas'
import { onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import type { Product } from '@/api/types'
import { useAppAbility } from '@/ability'
import { useServerTablePagination } from '@/composables/useServerTablePagination'
import { useProductStore } from '@/stores/product.store'
import { createProductFormRules } from '@/validation/product.form-rules'

const { can } = useAppAbility()
const productStore = useProductStore()
const { page, pageSize, total } = storeToRefs(productStore)

const { pagination, onChange: onTableChange } = useServerTablePagination({
  page,
  pageSize,
  total,
  fetchPage: (query) => productStore.fetchPage(query),
})

const open = ref(false)
const editing = ref<Product | null>(null)
const formRef = ref<FormInstance>()

interface ProductFormModel {
  sku: string
  name: string
  description: string
  price: number | undefined
  isActive: boolean
}

const model = reactive<ProductFormModel>({
  sku: '',
  name: '',
  description: '',
  price: 0,
  isActive: true,
})

const columns: TableColumnType<Product>[] = [
  { title: 'SKU', dataIndex: 'sku', key: 'sku' },
  { title: 'نام', dataIndex: 'name', key: 'name' },
  { title: 'قیمت', key: 'price' },
  { title: 'وضعیت', key: 'isActive' },
  { title: 'عملیات', key: 'actions', width: 180 },
]

function resetModel(): void {
  model.sku = ''
  model.name = ''
  model.description = ''
  model.price = 0
  model.isActive = true
}

function openCreate(): void {
  if (!can(PermissionAction.Create, PermissionResource.Products)) return
  editing.value = null
  resetModel()
  open.value = true
}

function openEdit(product: Product): void {
  if (!can(PermissionAction.Update, PermissionResource.Products)) return
  editing.value = product
  model.sku = product.sku
  model.name = product.name
  model.description = product.description ?? ''
  model.price = product.price
  model.isActive = product.isActive
  open.value = true
}

async function onSubmit(): Promise<void> {
  if (editing.value) {
    if (!can(PermissionAction.Update, PermissionResource.Products)) {
      return Promise.reject(new Error('forbidden'))
    }
  } else if (!can(PermissionAction.Create, PermissionResource.Products)) {
    return Promise.reject(new Error('forbidden'))
  }
  try {
    await formRef.value?.validate()
  } catch {
    return Promise.reject(new Error('validation'))
  }

  if (model.price === undefined || Number.isNaN(model.price)) {
    return Promise.reject(new Error('price'))
  }

  const description =
    model.description.trim() !== '' ? model.description.trim() : null

  if (editing.value) {
    const dto: UpdateProductDto = {
      sku: model.sku,
      name: model.name,
      description,
      price: model.price,
      isActive: model.isActive,
    }
    const ok = await productStore.update(editing.value.id, dto)
    if (!ok) return Promise.reject(new Error('save'))
    open.value = false
    return
  }

  const dto: CreateProductDto = {
    sku: model.sku,
    name: model.name,
    description,
    price: model.price,
    isActive: model.isActive,
  }
  const ok = await productStore.create(dto)
  if (!ok) return Promise.reject(new Error('save'))
  open.value = false
}

async function removeProduct(product: Product): Promise<void> {
  if (!can(PermissionAction.Delete, PermissionResource.Products)) return
  await productStore.remove(product.id)
}

function asProduct(record: unknown): Product {
  return record as Product
}

onMounted(async () => {
  if (can(PermissionAction.Read, PermissionResource.Products)) {
    await productStore.fetchPage()
  }
})
</script>

<template>
  <Card title="محصولات">
    <template #extra>
      <Can :I="PermissionAction.Create" :a="PermissionResource.Products">
        <Button type="primary" @click="openCreate">
          <template #icon>
            <PlusOutlined />
          </template>
          محصول جدید
        </Button>
      </Can>
    </template>

    <TypographyParagraph type="secondary">
      مدیریت محصولات
    </TypographyParagraph>

    <Can :I="PermissionAction.Read" :a="PermissionResource.Products">
      <Table
        row-key="id"
        size="middle"
        :columns="columns"
        :data-source="productStore.productList"
        :loading="productStore.loading"
        :pagination="pagination"
        @change="onTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'price'">
            {{ Number(asProduct(record).price).toLocaleString('fa-IR') }}
          </template>
          <template v-else-if="column.key === 'isActive'">
            <Tag :color="asProduct(record).isActive ? 'success' : 'default'">
              {{ asProduct(record).isActive ? 'فعال' : 'غیرفعال' }}
            </Tag>
          </template>
          <template v-else-if="column.key === 'actions'">
            <Space>
              <Can :I="PermissionAction.Update" :a="PermissionResource.Products">
                <Button type="link" @click="openEdit(asProduct(record))">
                  <template #icon>
                    <EditOutlined />
                  </template>
                  ویرایش
                </Button>
              </Can>
              <Can :I="PermissionAction.Delete" :a="PermissionResource.Products">
                <Popconfirm
                  title="حذف محصول"
                  :description="`محصول «${asProduct(record).name}» حذف شود؟`"
                  ok-text="حذف"
                  ok-type="danger"
                  cancel-text="انصراف"
                  @confirm="removeProduct(asProduct(record))"
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
        can(PermissionAction.Create, PermissionResource.Products) ||
        can(PermissionAction.Update, PermissionResource.Products)
      "
      v-model:open="open"
      :title="editing ? 'ویرایش محصول' : 'محصول جدید'"
      :confirm-loading="productStore.saving"
      destroy-on-close
      ok-text="ذخیره"
      cancel-text="انصراف"
      @ok="onSubmit"
    >
      <Form
        ref="formRef"
        layout="vertical"
        :model="model"
        :rules="createProductFormRules"
      >
        <FormItem label="SKU" name="sku">
          <Input v-model:value="model.sku" autocomplete="off" allow-clear />
        </FormItem>
        <FormItem label="نام" name="name">
          <Input v-model:value="model.name" allow-clear />
        </FormItem>
        <FormItem label="قیمت" name="price">
          <InputNumber
            v-model:value="model.price"
            class="w-full"
            :min="0"
            :step="0.01"
            :precision="2"
          />
        </FormItem>
        <FormItem label="توضیح" name="description">
          <Textarea
            v-model:value="model.description"
            :rows="3"
            allow-clear
          />
        </FormItem>
        <FormItem label="فعال" name="isActive">
          <Switch v-model:checked="model.isActive" />
        </FormItem>
      </Form>
    </Modal>
  </Card>
</template>
