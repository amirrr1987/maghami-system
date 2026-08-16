import type { PaginationQuery } from '@vue-nestjs-admin-template/schemas'
import type { TableProps } from 'ant-design-vue/es/table'
import type { TablePaginationConfig } from 'ant-design-vue/es/table/interface'
import { computed, type Ref } from 'vue'

type FetchPage = (query: PaginationQuery) => Promise<void>

/**
 * Bind antdv Table `pagination` + `onChange` to server-side page state.
 */
export function useServerTablePagination(options: {
  page: Ref<number>
  pageSize: Ref<number>
  total: Ref<number>
  fetchPage: FetchPage
}) {
  const pagination = computed<TablePaginationConfig>(() => ({
    current: options.page.value,
    pageSize: options.pageSize.value,
    total: options.total.value,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ['5','10', '20', '50'],
  }))

  const onChange: TableProps['onChange'] = (pag) => {
    void options.fetchPage({
      page: pag.current ?? 1,
      pageSize: pag.pageSize ?? options.pageSize.value,
    })
  }

  return { pagination, onChange }
}
