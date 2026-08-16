import { message } from 'ant-design-vue'
import type {
  CreateProductDto,
  PaginationQuery,
  UpdateProductDto,
} from '@vue-nestjs-admin-template/schemas'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { productsApi } from '@/api/products.api'
import { ApiError } from '@/api/types'
import type { Product } from '@/api/types'

function notifyError(error: unknown, fallback: string): void {
  if (error instanceof ApiError) {
    message.error(error.message)
    return
  }
  message.error(fallback)
}

export const useProductStore = defineStore('product', () => {
  const productList = ref<Product[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(5)
  const loading = ref(false)
  const saving = ref(false)

  async function fetchPage(
    query: PaginationQuery = { page: page.value, pageSize: pageSize.value },
  ): Promise<void> {
    loading.value = true
    try {
      const result = await productsApi.list(query)
      productList.value = result.items
      total.value = result.total
      page.value = result.page
      pageSize.value = result.pageSize
    } catch (error) {
      notifyError(error, 'بارگذاری محصولات ناموفق بود')
    } finally {
      loading.value = false
    }
  }

  async function create(dto: CreateProductDto): Promise<Product | null> {
    saving.value = true
    try {
      const created = await productsApi.create(dto)
      message.success('محصول ایجاد شد')
      await fetchPage({ page: 1, pageSize: pageSize.value })
      return created
    } catch (error) {
      notifyError(error, 'ایجاد محصول ناموفق بود')
      return null
    } finally {
      saving.value = false
    }
  }

  async function update(
    id: string,
    dto: UpdateProductDto,
  ): Promise<Product | null> {
    saving.value = true
    try {
      const updated = await productsApi.update(id, dto)
      message.success('محصول به‌روزرسانی شد')
      await fetchPage()
      return updated
    } catch (error) {
      notifyError(error, 'به‌روزرسانی محصول ناموفق بود')
      return null
    } finally {
      saving.value = false
    }
  }

  async function remove(id: string): Promise<boolean> {
    saving.value = true
    try {
      await productsApi.remove(id)
      message.success('محصول حذف شد')
      await fetchPage()
      return true
    } catch (error) {
      notifyError(error, 'حذف محصول ناموفق بود')
      return false
    } finally {
      saving.value = false
    }
  }

  return {
    productList,
    total,
    page,
    pageSize,
    loading,
    saving,
    fetchPage,
    create,
    update,
    remove,
  }
})
