<script setup lang="ts">
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { Can } from '@casl/vue'
import {
  Button,
  Card,
  Flex,
  Form,
  FormItem,
  Input,
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
  CreateProductAttributeDto,
  ProductAttributeType,
  UpdateProductAttributeDto,
} from '@maghami-system/schemas'
import { PermissionAction, PermissionResource } from '@maghami-system/schemas'
import { computed, reactive, ref, toRefs, watch } from 'vue'
import type { ProductAttribute } from '@/api/types'
import ResponsiveTable from '@/components/ResponsiveTable.vue'
import { useAppAbility } from '@/ability'
import { useServerTablePagination } from '@/composables/useServerTablePagination'
import { useProductAttributes } from '@/queries/use-product-attributes'
import {
  PRODUCT_ATTRIBUTE_TYPE_OPTIONS,
  productAttributeFormRules,
} from '@/validation/product-attribute.form-rules'

const { can } = useAppAbility()
const attributeStore = useProductAttributes()
const { page, pageSize, total } = toRefs(attributeStore)

const { pagination, onChange: onTableChange } = useServerTablePagination({
  page,
  pageSize,
  total,
  fetchPage: (query) => attributeStore.fetchPage(query),
})

const OPTION_MAX = 100
const OPTION_VALUE_MAX = 128

type OptionDraft = { key: number; value: string }

let optionSeq = 0

function optionDraft(value = ''): OptionDraft {
  optionSeq += 1
  return { key: optionSeq, value }
}

const open = ref(false)
const editing = ref<ProductAttribute | null>(null)
const formRef = ref<FormInstance>()

const model = reactive({
  name: '',
  code: '',
  type: 'TEXT' as ProductAttributeType,
  options: [optionDraft()] as OptionDraft[],
  isActive: true,
})

const showOptions = computed(() => model.type === 'SELECT')

watch(showOptions, (visible) => {
  if (visible && model.options.length === 0) {
    model.options = [optionDraft()]
  }
})

const columns: TableColumnType<ProductAttribute>[] = [
  { title: 'نام', dataIndex: 'name', key: 'name' },
  { title: 'کد', dataIndex: 'code', key: 'code' },
  { title: 'نوع', dataIndex: 'type', key: 'type' },
  { title: 'وضعیت', key: 'isActive', width: 100 },
  { title: 'عملیات', key: 'actions', width: 180 },
]

function resetModel(): void {
  model.name = ''
  model.code = ''
  model.type = 'TEXT'
  model.options = [optionDraft()]
  model.isActive = true
}

function addOption(): void {
  if (model.options.length >= OPTION_MAX) return
  model.options.push(optionDraft())
}

function removeOption(index: number): void {
  if (model.options.length <= 1) return
  model.options.splice(index, 1)
}

function openCreate(): void {
  if (!can(PermissionAction.Create, PermissionResource.ProductAttributes)) return
  editing.value = null
  resetModel()
  open.value = true
}

function openEdit(row: ProductAttribute): void {
  if (!can(PermissionAction.Update, PermissionResource.ProductAttributes)) return
  editing.value = row
  model.name = row.name
  model.code = row.code
  model.type = row.type
  const existing = row.options ?? []
  model.options =
    existing.length > 0 ? existing.map((value) => optionDraft(value)) : [optionDraft()]
  model.isActive = row.isActive
  open.value = true
}

function parseOptions(): string[] | null {
  if (model.type !== 'SELECT') return null
  return model.options.map((row) => row.value.trim()).filter((value) => value.length > 0)
}

async function onSubmit(): Promise<void> {
  try {
    await formRef.value?.validate()
  } catch {
    return Promise.reject(new Error('validation'))
  }

  const options = parseOptions()
  if (model.type === 'SELECT' && (!options || options.length < 1)) {
    return Promise.reject(new Error('options'))
  }

  if (editing.value) {
    const dto: UpdateProductAttributeDto = {
      name: model.name,
      code: model.code,
      type: model.type,
      options,
      isActive: model.isActive,
    }
    const ok = await attributeStore.update(editing.value.id, dto)
    if (!ok) return Promise.reject(new Error('save'))
    open.value = false
    return
  }

  const dto: CreateProductAttributeDto = {
    name: model.name,
    code: model.code,
    type: model.type,
    options,
    isActive: model.isActive,
  }
  const ok = await attributeStore.create(dto)
  if (!ok) return Promise.reject(new Error('save'))
  open.value = false
}

async function removeRow(row: ProductAttribute): Promise<void> {
  if (!can(PermissionAction.Delete, PermissionResource.ProductAttributes)) return
  await attributeStore.remove(row.id)
}

function asRow(record: unknown): ProductAttribute {
  return record as ProductAttribute
}
</script>

<template>
  <Card title="ویژگی کالا">
    <template #extra>
      <Can :I="PermissionAction.Create" :a="PermissionResource.ProductAttributes">
        <Button type="primary" @click="openCreate">
          <template #icon>
            <PlusOutlined />
          </template>
          ویژگی جدید
        </Button>
      </Can>
    </template>

    <TypographyParagraph type="secondary">
      ویژگی‌های پویا برای فرم محصول (متن، عدد، انتخابی، بله/خیر)
    </TypographyParagraph>

    <Can :I="PermissionAction.Read" :a="PermissionResource.ProductAttributes">
      <ResponsiveTable
        row-key="id"
        size="middle"
        :columns="columns"
        :data-source="attributeStore.attributeList"
        :loading="attributeStore.loading"
        :pagination="pagination"
        @change="onTableChange"
      >
        <template #bodyCell="{ column, record, text }">
          <template v-if="column.key === 'isActive'">
            <Tag :color="asRow(record).isActive ? 'success' : 'default'">
              {{ asRow(record).isActive ? 'فعال' : 'غیرفعال' }}
            </Tag>
          </template>
          <template v-else-if="column.key === 'actions'">
            <Space>
              <Can :I="PermissionAction.Update" :a="PermissionResource.ProductAttributes">
                <Button type="link" @click="openEdit(asRow(record))">
                  <template #icon>
                    <EditOutlined />
                  </template>
                  ویرایش
                </Button>
              </Can>
              <Can :I="PermissionAction.Delete" :a="PermissionResource.ProductAttributes">
                <Popconfirm
                  title="حذف ویژگی"
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
        can(PermissionAction.Create, PermissionResource.ProductAttributes) ||
        can(PermissionAction.Update, PermissionResource.ProductAttributes)
      "
      v-model:open="open"
      :title="editing ? 'ویرایش ویژگی' : 'ویژگی جدید'"
      :confirm-loading="attributeStore.saving"
      destroy-on-close
      ok-text="ذخیره"
      cancel-text="انصراف"
      @ok="onSubmit"
    >
      <Form ref="formRef" layout="vertical" :model="model" :rules="productAttributeFormRules">
        <FormItem label="نام" name="name">
          <Input v-model:value="model.name" allow-clear />
        </FormItem>
        <FormItem label="کد" name="code">
          <Input v-model:value="model.code" allow-clear />
        </FormItem>
        <FormItem label="نوع" name="type">
          <Select v-model:value="model.type" :options="PRODUCT_ATTRIBUTE_TYPE_OPTIONS" />
        </FormItem>
        <FormItem v-if="showOptions" label="گزینه‌ها" name="options">
          <Space direction="vertical" class="w-full" :size="8">
            <Flex
              v-for="(row, index) in model.options"
              :key="row.key"
              align="center"
              :gap="8"
              class="w-full"
            >
              <Input
                v-model:value="row.value"
                class="min-w-0 flex-1"
                allow-clear
                :maxlength="OPTION_VALUE_MAX"
                :placeholder="`گزینه ${index + 1}`"
              />
              <Button
                type="text"
                danger
                :disabled="model.options.length <= 1"
                :aria-label="`حذف گزینه ${index + 1}`"
                @click="removeOption(index)"
              >
                <template #icon>
                  <DeleteOutlined />
                </template>
              </Button>
            </Flex>
            <Button
              type="dashed"
              block
              :disabled="model.options.length >= OPTION_MAX"
              @click="addOption"
            >
              <template #icon>
                <PlusOutlined />
              </template>
              افزودن گزینه
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
