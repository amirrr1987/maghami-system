<script setup lang="ts">
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
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
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Textarea,
  TypographyParagraph,
  TypographyText,
} from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue/es/form'
import type { TableColumnType } from 'ant-design-vue'
import type {
  CreateProductDto,
  ProductAttribute,
  UpdateProductDto,
} from '@maghami-system/schemas'
import {
  PermissionAction,
  PermissionResource,
} from '@maghami-system/schemas'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { productsApi } from '@/api/products.api'
import type { Product } from '@/api/types'
import { useAppAbility } from '@/ability'
import { useServerTablePagination } from '@/composables/useServerTablePagination'
import { useProductAttributeStore } from '@/stores/product-attribute.store'
import { useProductBrandStore } from '@/stores/product-brand.store'
import { useProductCategoryStore } from '@/stores/product-category.store'
import { useProductStore } from '@/stores/product.store'
import { useProductUnitStore } from '@/stores/product-unit.store'
import { createProductFormRules } from '@/validation/product.form-rules'

const { can } = useAppAbility()
const productStore = useProductStore()
const categoryStore = useProductCategoryStore()
const brandStore = useProductBrandStore()
const unitStore = useProductUnitStore()
const attributeStore = useProductAttributeStore()
const { page, pageSize, total } = storeToRefs(productStore)

const { pagination, onChange: onTableChange } = useServerTablePagination({
  page,
  pageSize,
  total,
  fetchPage: (query) =>
    productStore.fetchPage({
      ...query,
      q: searchInput.value.trim() || undefined,
    }),
})

const open = ref(false)
const editing = ref<Product | null>(null)
const formRef = ref<FormInstance>()
const searchInput = ref('')
const skuPreview = ref('')
const skuPreviewLoading = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | undefined
let previewTimer: ReturnType<typeof setTimeout> | undefined

const model = reactive({
  sku: '',
  name: '',
  categoryId: undefined as string | undefined,
  brandId: undefined as string | undefined,
  unitId: undefined as string | undefined,
  barcode: '',
  description: '',
  price: 0 as number | undefined,
  isActive: true,
  attributeValues: {} as Record<string, string>,
})

const categoryOptions = computed(() =>
  categoryStore.categoryList.map((row) => ({
    label: `${row.name} (${row.code})`,
    value: row.id,
  })),
)
const brandOptions = computed(() =>
  brandStore.brandList.map((row) => ({
    label: `${row.name} (${row.code})`,
    value: row.id,
  })),
)
const unitOptions = computed(() =>
  unitStore.unitList.map((row) => ({
    label: `${row.name} (${row.symbol})`,
    value: row.id,
  })),
)
const activeAttributes = computed(() =>
  attributeStore.attributeList.filter((row) => row.isActive),
)

const columns: TableColumnType<Product>[] = [
  { title: 'SKU', dataIndex: 'sku', key: 'sku' },
  { title: 'نام', dataIndex: 'name', key: 'name' },
  { title: 'بارکد', dataIndex: 'barcode', key: 'barcode' },
  { title: 'وضعیت', key: 'isActive', width: 100 },
  { title: 'عملیات', key: 'actions', width: 180 },
]

function resetModel(): void {
  model.sku = ''
  model.name = ''
  model.categoryId = undefined
  model.brandId = undefined
  model.unitId = undefined
  model.barcode = ''
  model.description = ''
  model.price = 0
  model.isActive = true
  model.attributeValues = {}
  skuPreview.value = ''
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
  model.categoryId = product.categoryId ?? undefined
  model.brandId = product.brandId ?? undefined
  model.unitId = product.unitId ?? undefined
  model.barcode = product.barcode ?? ''
  model.description = product.description ?? ''
  model.price = product.price
  model.isActive = product.isActive
  const values: Record<string, string> = {}
  for (const row of product.attributeValues ?? []) {
    values[row.attributeId] = row.value
  }
  model.attributeValues = values
  skuPreview.value = product.sku
  open.value = true
}

async function refreshSkuPreview(categoryId: string): Promise<void> {
  skuPreviewLoading.value = true
  try {
    const result = await productsApi.previewSku(categoryId)
    skuPreview.value = result.sku
  } catch {
    skuPreview.value = ''
  } finally {
    skuPreviewLoading.value = false
  }
}

watch(
  () => model.categoryId,
  (categoryId) => {
    if (previewTimer) clearTimeout(previewTimer)
    if (!categoryId || editing.value) return
    previewTimer = setTimeout(() => {
      void refreshSkuPreview(categoryId)
    }, 300)
  },
)

function onSearchInput(): void {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    void productStore.fetchPage({
      page: 1,
      pageSize: pageSize.value,
      q: searchInput.value.trim() || undefined,
    })
  }, 350)
}

function booleanOptions(): { label: string; value: string }[] {
  return [
    { label: 'بله', value: 'true' },
    { label: 'خیر', value: 'false' },
  ]
}

function selectOptionsFor(attr: ProductAttribute): { label: string; value: string }[] {
  return (attr.options ?? []).map((value) => ({ label: value, value }))
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
  if (!model.categoryId) return Promise.reject(new Error('category'))

  const description =
    model.description.trim() !== '' ? model.description.trim() : null
  const barcode = model.barcode.trim() !== '' ? model.barcode.trim() : null
  const sku = model.sku.trim() !== '' ? model.sku.trim() : undefined
  const attributeValues = Object.entries(model.attributeValues)
    .filter(([, value]) => value.trim() !== '')
    .map(([attributeId, value]) => ({ attributeId, value: value.trim() }))

  if (editing.value) {
    const dto: UpdateProductDto = {
      sku,
      name: model.name,
      categoryId: model.categoryId,
      brandId: model.brandId ?? null,
      unitId: model.unitId ?? null,
      barcode,
      description,
      price: model.price ?? 0,
      isActive: model.isActive,
      attributeValues,
    }
    const ok = await productStore.update(editing.value.id, dto)
    if (!ok) return Promise.reject(new Error('save'))
    open.value = false
    return
  }

  const dto: CreateProductDto = {
    sku,
    name: model.name,
    categoryId: model.categoryId,
    brandId: model.brandId ?? null,
    unitId: model.unitId ?? null,
    barcode,
    description,
    price: model.price ?? 0,
    isActive: model.isActive,
    attributeValues,
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
  const lookups: Promise<void>[] = []
  if (can(PermissionAction.Read, PermissionResource.ProductCategories)) {
    lookups.push(categoryStore.fetchPage({ page: 1, pageSize: 100 }))
  }
  if (can(PermissionAction.Read, PermissionResource.ProductBrands)) {
    lookups.push(brandStore.fetchPage({ page: 1, pageSize: 100 }))
  }
  if (can(PermissionAction.Read, PermissionResource.ProductUnits)) {
    lookups.push(unitStore.fetchPage({ page: 1, pageSize: 100 }))
  }
  if (can(PermissionAction.Read, PermissionResource.ProductAttributes)) {
    lookups.push(attributeStore.fetchPage({ page: 1, pageSize: 100 }))
  }
  await Promise.all(lookups)
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
      مدیریت محصولات و تولید خودکار SKU بر اساس الگوی دسته‌بندی
    </TypographyParagraph>

    <Can :I="PermissionAction.Read" :a="PermissionResource.Products">
      <Space class="mb-4 w-full" direction="vertical">
        <Input
          v-model:value="searchInput"
          allow-clear
          placeholder="جستجو بر اساس نام، SKU یا بارکد"
          @change="onSearchInput"
          @pressEnter="onSearchInput"
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </Input>
      </Space>

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
          <template v-if="column.key === 'barcode'">
            {{ asProduct(record).barcode ?? '—' }}
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
      width="720px"
      @ok="onSubmit"
    >
      <Form
        ref="formRef"
        layout="vertical"
        :model="model"
        :rules="createProductFormRules"
      >
        <FormItem label="دسته‌بندی" name="categoryId">
          <Select
            v-model:value="model.categoryId"
            show-search
            option-filter-prop="label"
            :options="categoryOptions"
            placeholder="انتخاب دسته‌بندی"
          />
        </FormItem>

        <FormItem label="SKU پیشنهادی / دستی" name="sku">
          <Input
            v-model:value="model.sku"
            allow-clear
            :placeholder="
              editing
                ? 'SKU'
                : skuPreview || 'خالی بگذارید تا خودکار تولید شود'
            "
          />
          <TypographyText
            v-if="!editing && (skuPreview || skuPreviewLoading)"
            type="secondary"
            class="mt-1 block"
          >
            {{
              skuPreviewLoading
                ? 'در حال پیش‌نمایش SKU…'
                : `پیش‌نمایش: ${skuPreview}`
            }}
          </TypographyText>
        </FormItem>

        <FormItem label="نام" name="name">
          <Input v-model:value="model.name" allow-clear />
        </FormItem>

        <FormItem label="برند" name="brandId">
          <Select
            v-model:value="model.brandId"
            allow-clear
            show-search
            option-filter-prop="label"
            :options="brandOptions"
            placeholder="اختیاری"
          />
        </FormItem>

        <FormItem label="واحد" name="unitId">
          <Select
            v-model:value="model.unitId"
            allow-clear
            show-search
            option-filter-prop="label"
            :options="unitOptions"
            placeholder="اختیاری"
          />
        </FormItem>

        <FormItem label="بارکد" name="barcode">
          <Input v-model:value="model.barcode" allow-clear />
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
          <Textarea v-model:value="model.description" :rows="3" allow-clear />
        </FormItem>

        <template v-if="activeAttributes.length > 0">
          <TypographyText strong class="mb-2 block">ویژگی‌ها</TypographyText>
          <FormItem
            v-for="attr in activeAttributes"
            :key="attr.id"
            :label="`${attr.name} (${attr.code})`"
          >
            <Select
              v-if="attr.type === 'SELECT'"
              v-model:value="model.attributeValues[attr.id]"
              allow-clear
              :options="selectOptionsFor(attr)"
            />
            <Select
              v-else-if="attr.type === 'BOOLEAN'"
              v-model:value="model.attributeValues[attr.id]"
              allow-clear
              :options="booleanOptions()"
            />
            <InputNumber
              v-else-if="attr.type === 'NUMBER'"
              class="w-full"
              :value="
                model.attributeValues[attr.id]
                  ? Number(model.attributeValues[attr.id])
                  : undefined
              "
              @update:value="
                (value) => {
                  model.attributeValues[attr.id] =
                    value === null || value === undefined ? '' : String(value)
                }
              "
            />
            <Input
              v-else
              v-model:value="model.attributeValues[attr.id]"
              allow-clear
            />
          </FormItem>
        </template>

        <FormItem label="فعال" name="isActive">
          <Switch v-model:checked="model.isActive" />
        </FormItem>
      </Form>
    </Modal>
  </Card>
</template>
