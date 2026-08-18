<script setup lang="ts">
import { Card, Empty, Flex, Pagination, Space, Spin, Table, TypographyText } from 'ant-design-vue'
import type { TableColumnType } from 'ant-design-vue'
import type { TableProps } from 'ant-design-vue/es/table'
import type {
  FilterValue,
  SorterResult,
  TableCurrentDataSource,
  TablePaginationConfig,
} from 'ant-design-vue/es/table/interface'
import { computed } from 'vue'
import { getTableColumnText } from '@/utils/table-column-text'

type TableRow = Record<string, unknown>

export interface ResponsiveTableBodyCellProps {
  column: TableColumnType
  record: TableRow
  text: string
  index: number
}

const props = withDefaults(
  defineProps<{
    rowKey: string | ((record: TableRow) => string)
    columns: TableColumnType[]
    dataSource: object[]
    loading?: boolean
    pagination?: TablePaginationConfig | false
    size?: TableProps['size']
  }>(),
  {
    loading: false,
    size: 'middle',
  },
)

const emit = defineEmits<{
  change: [
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult | SorterResult[],
    extra: TableCurrentDataSource,
  ]
}>()

const onTableChange: NonNullable<TableProps['onChange']> = (pagination, filters, sorter, extra) => {
  emit('change', pagination, filters, sorter, extra)
}

function resolveRowKey(record: object): string {
  const row = record as TableRow
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row)
  }
  return String(row[props.rowKey])
}

function cellText(column: TableColumnType, record: object): string {
  return getTableColumnText(record, column)
}

const bodyColumns = computed(() =>
  props.columns.filter(
    (col) => col.key !== 'actions' && !('type' in col && col.type === 'divider'),
  ),
)

const actionsColumn = computed(() => props.columns.find((col) => col.key === 'actions'))

function onMobilePageChange(page: number, pageSize: number): void {
  const total = props.pagination ? (props.pagination.total ?? 0) : 0
  onTableChange(
    { current: page, pageSize, total },
    {},
    {},
    { action: 'paginate', currentDataSource: props.dataSource },
  )
}
</script>

<template>
  <div class="hidden lg:block">
    <Table
      :row-key="rowKey"
      :size="size"
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="pagination"
      @change="onTableChange"
    >
      <template #bodyCell="slotProps">
        <slot
          name="bodyCell"
          :column="slotProps.column"
          :record="slotProps.record as TableRow"
          :text="String(slotProps.text ?? cellText(slotProps.column, slotProps.record as TableRow))"
          :index="slotProps.index"
        />
      </template>
    </Table>
  </div>

  <div class="lg:hidden">
    <Spin :spinning="loading">
      <Empty v-if="!loading && dataSource.length === 0" class="py-8" />

      <Space v-else direction="vertical" class="w-full" :size="12">
        <Card v-for="(record, index) in dataSource" :key="resolveRowKey(record)" size="small">
          <Flex vertical :gap="8">
            <Flex
              v-for="column in bodyColumns"
              :key="String(column.key ?? column.dataIndex)"
              vertical
              :gap="4"
              class="w-full"
            >
              <TypographyText type="secondary" class="text-sm">
                {{ column.title }}
              </TypographyText>
              <div class="min-w-0">
                <slot
                  name="bodyCell"
                  :column="column"
                  :record="record"
                  :text="cellText(column, record)"
                  :index="index"
                />
              </div>
            </Flex>

            <div
              v-if="actionsColumn"
              class="border-t border-neutral-200 pt-3 dark:border-neutral-700"
            >
              <slot
                name="bodyCell"
                :column="actionsColumn"
                :record="record"
                :text="cellText(actionsColumn, record)"
                :index="index"
              />
            </div>
          </Flex>
        </Card>
      </Space>

      <Pagination
        v-if="pagination && dataSource.length > 0"
        class="mt-4 flex justify-center"
        :current="pagination.current"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        simple
        @change="onMobilePageChange"
      />
    </Spin>
  </div>
</template>
