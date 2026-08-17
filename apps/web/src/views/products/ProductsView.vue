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
import { computed, reactive, ref, toRefs, watch } from 'vue'
import { productsApi } from '@/api/products.api'
import type { Product } from '@/api/types'
import { useAppAbility } from '@/ability'
import { useServerTablePagination } from '@/composables/useServerTablePagination'
import { useProductAttributes } from '@/queries/use-product-attributes'
import { useProductBrands } from '@/queries/use-product-brands'
import { useProductCategories } from '@/queries/use-product-categories'
import { useProducts } from '@/queries/use-products'
import { useProductUnits } from '@/queries/use-product-units'
import { createProductFormRules } from '@/validation/product.form-rules'

const { can } = useAppAbility()
const productStore = useProducts()
const categoryStore = useProductCategories({
  pageSize: 100,
  enabled: () =>
    can(PermissionAction.Read, PermissionResource.ProductCategories),
})
const brandStore = useProductBrands({
  pageSize: 100,
  enabled: () => can(PermissionAction.Read, PermissionResource.ProductBrands),
})
const unitStore = useProductUnits({
  pageSize: 100,
  enabled: () => can(PermissionAction.Read, PermissionResource.ProductUnits),
})
const attributeStore = useProductAttributes({
  pageSize: 100,
  enabled: () =>
    can(PermissionAction.Read, PermissionResource.ProductAttributes),
})
const { page, pageSize, total } = toRefs(productStore)

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

let attributeRowKey = 0

type AttributeRow = {
  key: string
  attributeId: string | undefined
  value: string
}

function nextAttributeRowKey(): string {
  attributeRowKey += 1
  return `attr-row-${attributeRowKey}`
}

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
  attributeRows: [] as AttributeRow[],
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
  model.attributeRows = []
  skuPreview.value = ''
}

function addAttributeRow(): void {
  model.attributeRows.push({
    key: nextAttributeRowKey(),
    attributeId: undefined,
    value: '',
  })
}

function removeAttributeRow(key: string): void {
  model.attributeRows = model.attributeRows.filter((row) => row.key !== key)
}

function attributeById(id: string | undefined): ProductAttribute | undefined {
  if (!id) return undefined
  return activeAttributes.value.find((row) => row.id === id)
}

function attributeSelectOptions(
  rowKey: string,
): { label: string; value: string }[] {
  const usedIds = new Set(
    model.attributeRows
      .filter((row) => row.key !== rowKey && row.attributeId)
      .map((row) => row.attributeId as string),
  )
  return activeAttributes.value
    .filter((attr) => !usedIds.has(attr.id))
    .map((attr) => ({
      label: `${attr.name} (${attr.code})`,
      value: attr.id,
    }))
}

function onAttributeRowAttributeChange(row: AttributeRow): void {
  row.value = ''
}

function buildAttributeValues(): NonNullable<CreateProductDto['attributeValues']> {
  return model.attributeRows
    .filter((row) => row.attributeId && row.value.trim() !== '')
    .map((row) => ({
      attributeId: row.attributeId as string,
      value: row.value.trim(),
    }))
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
  model.attributeRows = (product.attributeValues ?? []).map((row) => ({
    key: nextAttributeRowKey(),
    attributeId: row.attributeId,
    value: row.value,
  }))
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

function selectOptionsForRow(row: AttributeRow): { label: string; value: string }[] {
  const attr = attributeById(row.attributeId)
  if (!attr) return []
  return selectOptionsFor(attr)
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
  const attributeValues = buildAttributeValues()

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

        <FormItem label="ویژگی‌ها">
          <TypographyText
            v-if="activeAttributes.length === 0"
            type="secondary"
            class="mb-2 block"
          >
            ابتدا از منوی «ویژگی‌های محصول» ویژگی فعال تعریف کنید.
          </TypographyText>
          <Space v-else direction="vertical" class="w-full" size="middle">
            <Space
              v-for="row in model.attributeRows"
              :key="row.key"
              align="start"
              class="w-full"
            >
              <Select
                v-model:value="row.attributeId"
                show-search
                option-filter-prop="label"
                :options="attributeSelectOptions(row.key)"
                placeholder="انتخاب ویژگی"
                class="min-w-48"
                @change="onAttributeRowAttributeChange(row)"
              />
              <Select
                v-if="attributeById(row.attributeId)?.type === 'SELECT'"
                v-model:value="row.value"
                allow-clear
                class="min-w-48 flex-1"
                placeholder="مقدار"
                :options="selectOptionsForRow(row)"
              />
              <Select
                v-else-if="attributeById(row.attributeId)?.type === 'BOOLEAN'"
                v-model:value="row.value"
                allow-clear
                class="min-w-48 flex-1"
                placeholder="مقدار"
                :options="booleanOptions()"
              />
              <InputNumber
                v-else-if="attributeById(row.attributeId)?.type === 'NUMBER'"
                class="min-w-48 flex-1"
                placeholder="مقدار"
                :value="row.value ? Number(row.value) : undefined"
                @update:value="
                  (value) => {
                    row.value =
                      value === null || value === undefined ? '' : String(value)
                  }
                "
              />
              <Input
                v-else-if="row.attributeId"
                v-model:value="row.value"
                allow-clear
                class="min-w-48 flex-1"
                placeholder="مقدار"
              />
              <Input
                v-else
                disabled
                class="min-w-48 flex-1"
                placeholder="ابتدا ویژگی را انتخاب کنید"
              />
              <Button
                type="text"
                danger
                aria-label="حذف ویژگی"
                @click="removeAttributeRow(row.key)"
              >
                <template #icon>
                  <DeleteOutlined />
                </template>
              </Button>
            </Space>
            <Button
              type="dashed"
              block
              :disabled="model.attributeRows.length >= activeAttributes.length"
              @click="addAttributeRow"
            >
              <template #icon>
                <PlusOutlined />
              </template>
              افزودن ویژگی
            </Button>
          </Space>
        </FormItem>

        <FormItem label="فعال" name="isActive">
          <Switch v-model:checked="model.isActive" />
        </FormItem>
      </Form>
    </Modal>
  </Card>
</template>
