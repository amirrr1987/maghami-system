<script setup lang="ts">
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons-vue'
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
  Tag,
  TypographyParagraph,
} from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue/es/form'
import type { TableColumnType } from 'ant-design-vue'
import type {
  CreateProductCodePatternDto,
  UpdateProductCodePatternDto,
} from '@maghami-system/schemas'
import { PermissionAction, PermissionResource } from '@maghami-system/schemas'
import { computed, reactive, ref, toRefs } from 'vue'
import type { ProductCodePattern } from '@/api/types'
import ResponsiveTable from '@/components/ResponsiveTable.vue'
import { useAppAbility } from '@/ability'
import { useServerTablePagination } from '@/composables/useServerTablePagination'
import { useProductCategories } from '@/modules/product-categories/queries/use-product-categories'
import { useProductCodePatterns } from '@/modules/product-code-patterns/queries/use-product-code-patterns'
import { productCodePatternFormRules } from '@/modules/product-code-patterns/validation/product-code-pattern.form-rules'

const { can } = useAppAbility()
const patternStore = useProductCodePatterns()
const categoryStore = useProductCategories({
  pageSize: 100,
  enabled: () => can(PermissionAction.Read, PermissionResource.ProductCategories),
})
const { page, pageSize, total } = toRefs(patternStore)

const { pagination, onChange: onTableChange } = useServerTablePagination({
  page,
  pageSize,
  total,
  fetchPage: (query) => patternStore.fetchPage(query),
})

const open = ref(false)
const editing = ref<ProductCodePattern | null>(null)
const formRef = ref<FormInstance>()

const model = reactive({
  categoryId: undefined as string | undefined,
  prefix: '',
  separator: '-',
  length: 6,
  isActive: true,
})

const categoryOptions = computed(() =>
  categoryStore.categoryList.map((row) => ({
    label: `${row.name} (${row.code})`,
    value: row.id,
  })),
)

const columns: TableColumnType<ProductCodePattern>[] = [
  { title: 'دسته‌بندی', key: 'categoryId' },
  { title: 'پیشوند', dataIndex: 'prefix', key: 'prefix' },
  { title: 'جداکننده', dataIndex: 'separator', key: 'separator' },
  { title: 'طول', dataIndex: 'length', key: 'length', width: 80 },
  { title: 'توالی بعدی', dataIndex: 'nextSequence', key: 'nextSequence', width: 110 },
  { title: 'وضعیت', key: 'isActive', width: 100 },
  { title: 'عملیات', key: 'actions', width: 180 },
]

function resetModel(): void {
  model.categoryId = undefined
  model.prefix = ''
  model.separator = '-'
  model.length = 6
  model.isActive = true
}

function openCreate(): void {
  if (!can(PermissionAction.Create, PermissionResource.ProductCodePatterns)) return
  editing.value = null
  resetModel()
  open.value = true
}

function openEdit(row: ProductCodePattern): void {
  if (!can(PermissionAction.Update, PermissionResource.ProductCodePatterns)) return
  editing.value = row
  model.categoryId = row.categoryId
  model.prefix = row.prefix
  model.separator = row.separator
  model.length = row.length
  model.isActive = row.isActive
  open.value = true
}

async function onSubmit(): Promise<void> {
  try {
    await formRef.value?.validate()
  } catch {
    return Promise.reject(new Error('validation'))
  }
  if (!model.categoryId) return Promise.reject(new Error('category'))

  if (editing.value) {
    const dto: UpdateProductCodePatternDto = {
      categoryId: model.categoryId,
      prefix: model.prefix,
      separator: model.separator,
      length: model.length,
      isActive: model.isActive,
    }
    const ok = await patternStore.update(editing.value.id, dto)
    if (!ok) return Promise.reject(new Error('save'))
    open.value = false
    return
  }

  const dto: CreateProductCodePatternDto = {
    categoryId: model.categoryId,
    prefix: model.prefix,
    separator: model.separator,
    length: model.length,
    isActive: model.isActive,
  }
  const ok = await patternStore.create(dto)
  if (!ok) return Promise.reject(new Error('save'))
  open.value = false
}

async function removeRow(row: ProductCodePattern): Promise<void> {
  if (!can(PermissionAction.Delete, PermissionResource.ProductCodePatterns)) return
  await patternStore.remove(row.id)
}

function asRow(record: unknown): ProductCodePattern {
  return record as ProductCodePattern
}

function categoryLabel(categoryId: string): string {
  const row = categoryStore.categoryList.find((item) => item.id === categoryId)
  return row ? `${row.name} (${row.code})` : categoryId
}
</script>

<template>
  <Card title="الگوی کدینگ SKU">
    <template #extra>
      <Can :I="PermissionAction.Create" :a="PermissionResource.ProductCodePatterns">
        <Button type="primary" @click="openCreate">
          <template #icon>
            <PlusOutlined />
          </template>
          الگوی جدید
        </Button>
      </Can>
    </template>

    <TypographyParagraph type="secondary">
      الگوی تولید خودکار SKU برای هر دسته‌بندی (مثلاً ELEC-000042)
    </TypographyParagraph>

    <Can :I="PermissionAction.Read" :a="PermissionResource.ProductCodePatterns">
      <ResponsiveTable
        row-key="id"
        size="middle"
        :columns="columns"
        :data-source="patternStore.patternList"
        :loading="patternStore.loading"
        :pagination="pagination"
        @change="onTableChange"
      >
        <template #bodyCell="{ column, record, text }">
          <template v-if="column.key === 'categoryId'">
            {{ categoryLabel(asRow(record).categoryId) }}
          </template>
          <template v-else-if="column.key === 'isActive'">
            <Tag :color="asRow(record).isActive ? 'success' : 'default'">
              {{ asRow(record).isActive ? 'فعال' : 'غیرفعال' }}
            </Tag>
          </template>
          <template v-else-if="column.key === 'actions'">
            <Space>
              <Can :I="PermissionAction.Update" :a="PermissionResource.ProductCodePatterns">
                <Button type="link" @click="openEdit(asRow(record))">
                  <template #icon>
                    <EditOutlined />
                  </template>
                  ویرایش
                </Button>
              </Can>
              <Can :I="PermissionAction.Delete" :a="PermissionResource.ProductCodePatterns">
                <Popconfirm
                  title="حذف الگو"
                  :description="`الگوی «${asRow(record).prefix}» حذف شود؟`"
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
        can(PermissionAction.Create, PermissionResource.ProductCodePatterns) ||
        can(PermissionAction.Update, PermissionResource.ProductCodePatterns)
      "
      v-model:open="open"
      :title="editing ? 'ویرایش الگو' : 'الگوی جدید'"
      :confirm-loading="patternStore.saving"
      destroy-on-close
      ok-text="ذخیره"
      cancel-text="انصراف"
      @ok="onSubmit"
    >
      <Form ref="formRef" layout="vertical" :model="model" :rules="productCodePatternFormRules">
        <FormItem label="دسته‌بندی" name="categoryId">
          <Select
            v-model:value="model.categoryId"
            show-search
            option-filter-prop="label"
            :options="categoryOptions"
            placeholder="انتخاب دسته‌بندی"
          />
        </FormItem>
        <FormItem label="پیشوند" name="prefix">
          <Input v-model:value="model.prefix" allow-clear />
        </FormItem>
        <FormItem label="جداکننده" name="separator">
          <Input v-model:value="model.separator" allow-clear />
        </FormItem>
        <FormItem label="طول عدد ترتیبی" name="length">
          <InputNumber v-model:value="model.length" class="w-full" :min="1" :max="12" />
        </FormItem>
        <FormItem label="فعال" name="isActive">
          <Switch v-model:checked="model.isActive" />
        </FormItem>
      </Form>
    </Modal>
  </Card>
</template>
