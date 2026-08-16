import { message } from 'ant-design-vue'
import type {
  CreateProductDto,
  ProductListQuery,
  UpdateProductDto,
} from '@maghami-system/schemas'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { productsApi } from '@/api/products.api'
import type { Product } from '@/api/types'
import { notifyApiError } from './notify-api-error'

export const useProductStore = defineStore('product', () => {
  const productList = ref<Product[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const q = ref('')
  const loading = ref(false)
  const saving = ref(false)

  async function fetchPage(
    query: Partial<ProductListQuery> = {},
  ): Promise<void> {
    loading.value = true
    const next: ProductListQuery = {
      page: query.page ?? page.value,
      pageSize: query.pageSize ?? pageSize.value,
      q: query.q !== undefined ? query.q : q.value || undefined,
      categoryId: query.categoryId,
      brandId: query.brandId,
      isActive: query.isActive,
    }
    try {
      const result = await productsApi.list(next)
      productList.value = result.items
      total.value = result.total
      page.value = result.page
      pageSize.value = result.pageSize
      if (query.q !== undefined) q.value = query.q ?? ''
    } catch (error) {
      notifyApiError(error, 'بارگذاری محصولات ناموفق بود')
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
      notifyApiError(error, 'ایجاد محصول ناموفق بود')
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
      notifyApiError(error, 'به‌روزرسانی محصول ناموفق بود')
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
      notifyApiError(error, 'حذف محصول ناموفق بود')
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
    q,
    loading,
    saving,
    fetchPage,
    create,
    update,
    remove,
  }
})
