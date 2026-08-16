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
  Select,
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
  CreateProductAttributeDto,
  ProductAttributeType,
  UpdateProductAttributeDto,
} from '@maghami-system/schemas'
import {
  PermissionAction,
  PermissionResource,
} from '@maghami-system/schemas'
import { computed, onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import type { ProductAttribute } from '@/api/types'
import { useAppAbility } from '@/ability'
import { useServerTablePagination } from '@/composables/useServerTablePagination'
import { useProductAttributeStore } from '@/stores/product-attribute.store'
import {
  PRODUCT_ATTRIBUTE_TYPE_OPTIONS,
  productAttributeFormRules,
} from '@/validation/product-attribute.form-rules'

const { can } = useAppAbility()
const attributeStore = useProductAttributeStore()
const { page, pageSize, total } = storeToRefs(attributeStore)

const { pagination, onChange: onTableChange } = useServerTablePagination({
  page,
  pageSize,
  total,
  fetchPage: (query) => attributeStore.fetchPage(query),
})

const open = ref(false)
const editing = ref<ProductAttribute | null>(null)
const formRef = ref<FormInstance>()

const model = reactive({
  name: '',
  code: '',
  type: 'TEXT' as ProductAttributeType,
  optionsText: '',
  isActive: true,
})

const showOptions = computed(() => model.type === 'SELECT')

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
  model.optionsText = ''
  model.isActive = true
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
  model.optionsText = (row.options ?? []).join('\n')
  model.isActive = row.isActive
  open.value = true
}

function parseOptions(): string[] | null {
  if (model.type !== 'SELECT') return null
  return model.optionsText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
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

onMounted(async () => {
  if (can(PermissionAction.Read, PermissionResource.ProductAttributes)) {
    await attributeStore.fetchPage()
  }
})
</script>

<template>
  <Card title="ویژگی کالا">
    <template #extra>
      <Can
        :I="PermissionAction.Create"
        :a="PermissionResource.ProductAttributes"
      >
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
      <Table
        row-key="id"
        size="middle"
        :columns="columns"
        :data-source="attributeStore.attributeList"
        :loading="attributeStore.loading"
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
                :a="PermissionResource.ProductAttributes"
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
                :a="PermissionResource.ProductAttributes"
              >
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
        </template>
      </Table>
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
      <Form
        ref="formRef"
        layout="vertical"
        :model="model"
        :rules="productAttributeFormRules"
      >
        <FormItem label="نام" name="name">
          <Input v-model:value="model.name" allow-clear />
        </FormItem>
        <FormItem label="کد" name="code">
          <Input v-model:value="model.code" allow-clear />
        </FormItem>
        <FormItem label="نوع" name="type">
          <Select
            v-model:value="model.type"
            :options="PRODUCT_ATTRIBUTE_TYPE_OPTIONS"
          />
        </FormItem>
        <FormItem v-if="showOptions" label="گزینه‌ها (هر خط یک گزینه)" name="options">
          <Textarea v-model:value="model.optionsText" :rows="4" allow-clear />
        </FormItem>
        <FormItem label="فعال" name="isActive">
          <Switch v-model:checked="model.isActive" />
        </FormItem>
      </Form>
    </Modal>
  </Card>
</template>
