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
  Space,
  Switch,
  Tag,
  TypographyParagraph,
} from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue/es/form'
import type { TableColumnType } from 'ant-design-vue'
import type { CreateProductUnitDto, UpdateProductUnitDto } from '@maghami-system/schemas'
import { PermissionAction, PermissionResource } from '@maghami-system/schemas'
import { reactive, ref, toRefs } from 'vue'
import type { ProductUnit } from '@/api/types'
import ResponsiveTable from '@/components/ResponsiveTable.vue'
import { useAppAbility } from '@/ability'
import { useServerTablePagination } from '@/composables/useServerTablePagination'
import { useProductUnits } from '@/modules/product-units/queries/use-product-units'
import { productUnitFormRules } from '@/modules/product-units/validation/product-unit.form-rules'

const { can } = useAppAbility()
const unitStore = useProductUnits()
const { page, pageSize, total } = toRefs(unitStore)

const { pagination, onChange: onTableChange } = useServerTablePagination({
  page,
  pageSize,
  total,
  fetchPage: (query) => unitStore.fetchPage(query),
})

const open = ref(false)
const editing = ref<ProductUnit | null>(null)
const formRef = ref<FormInstance>()

const model = reactive({
  name: '',
  code: '',
  symbol: '',
  isActive: true,
})

const columns: TableColumnType<ProductUnit>[] = [
  { title: 'نام', dataIndex: 'name', key: 'name' },
  { title: 'کد', dataIndex: 'code', key: 'code' },
  { title: 'نماد', dataIndex: 'symbol', key: 'symbol' },
  { title: 'وضعیت', key: 'isActive', width: 100 },
  { title: 'عملیات', key: 'actions', width: 180 },
]

function resetModel(): void {
  model.name = ''
  model.code = ''
  model.symbol = ''
  model.isActive = true
}

function openCreate(): void {
  if (!can(PermissionAction.Create, PermissionResource.ProductUnits)) return
  editing.value = null
  resetModel()
  open.value = true
}

function openEdit(row: ProductUnit): void {
  if (!can(PermissionAction.Update, PermissionResource.ProductUnits)) return
  editing.value = row
  model.name = row.name
  model.code = row.code
  model.symbol = row.symbol
  model.isActive = row.isActive
  open.value = true
}

async function onSubmit(): Promise<void> {
  try {
    await formRef.value?.validate()
  } catch {
    return Promise.reject(new Error('validation'))
  }

  if (editing.value) {
    const dto: UpdateProductUnitDto = {
      name: model.name,
      code: model.code,
      symbol: model.symbol,
      isActive: model.isActive,
    }
    const ok = await unitStore.update(editing.value.id, dto)
    if (!ok) return Promise.reject(new Error('save'))
    open.value = false
    return
  }

  const dto: CreateProductUnitDto = {
    name: model.name,
    code: model.code,
    symbol: model.symbol,
    isActive: model.isActive,
  }
  const ok = await unitStore.create(dto)
  if (!ok) return Promise.reject(new Error('save'))
  open.value = false
}

async function removeRow(row: ProductUnit): Promise<void> {
  if (!can(PermissionAction.Delete, PermissionResource.ProductUnits)) return
  await unitStore.remove(row.id)
}

function asRow(record: unknown): ProductUnit {
  return record as ProductUnit
}
</script>

<template>
  <Card title="واحد کالا">
    <template #extra>
      <Can :I="PermissionAction.Create" :a="PermissionResource.ProductUnits">
        <Button type="primary" @click="openCreate">
          <template #icon>
            <PlusOutlined />
          </template>
          واحد جدید
        </Button>
      </Can>
    </template>

    <TypographyParagraph type="secondary">
      واحدهای اندازه‌گیری (مثلاً kg، pcs)
    </TypographyParagraph>

    <Can :I="PermissionAction.Read" :a="PermissionResource.ProductUnits">
      <ResponsiveTable
        row-key="id"
        size="middle"
        :columns="columns"
        :data-source="unitStore.unitList"
        :loading="unitStore.loading"
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
              <Can :I="PermissionAction.Update" :a="PermissionResource.ProductUnits">
                <Button type="link" @click="openEdit(asRow(record))">
                  <template #icon>
                    <EditOutlined />
                  </template>
                  ویرایش
                </Button>
              </Can>
              <Can :I="PermissionAction.Delete" :a="PermissionResource.ProductUnits">
                <Popconfirm
                  title="حذف واحد"
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
        can(PermissionAction.Create, PermissionResource.ProductUnits) ||
        can(PermissionAction.Update, PermissionResource.ProductUnits)
      "
      v-model:open="open"
      :title="editing ? 'ویرایش واحد' : 'واحد جدید'"
      :confirm-loading="unitStore.saving"
      destroy-on-close
      ok-text="ذخیره"
      cancel-text="انصراف"
      @ok="onSubmit"
    >
      <Form ref="formRef" layout="vertical" :model="model" :rules="productUnitFormRules">
        <FormItem label="نام" name="name">
          <Input v-model:value="model.name" allow-clear />
        </FormItem>
        <FormItem label="کد" name="code">
          <Input v-model:value="model.code" allow-clear />
        </FormItem>
        <FormItem label="نماد" name="symbol">
          <Input v-model:value="model.symbol" allow-clear placeholder="kg" />
        </FormItem>
        <FormItem label="فعال" name="isActive">
          <Switch v-model:checked="model.isActive" />
        </FormItem>
      </Form>
    </Modal>
  </Card>
</template>
