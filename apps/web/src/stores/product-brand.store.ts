import { message } from 'ant-design-vue'
import type {
  CreateProductBrandDto,
  PaginationQuery,
  UpdateProductBrandDto,
} from '@maghami-system/schemas'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { productBrandsApi } from '@/api/product-brands.api'
import type { ProductBrand } from '@/api/types'
import { notifyApiError } from './notify-api-error'

export const useProductBrandStore = defineStore('productBrand', () => {
  const brandList = ref<ProductBrand[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const loading = ref(false)
  const saving = ref(false)

  async function fetchPage(
    query: PaginationQuery = { page: page.value, pageSize: pageSize.value },
  ): Promise<void> {
    loading.value = true
    try {
      const result = await productBrandsApi.list(query)
      brandList.value = result.items
      total.value = result.total
      page.value = result.page
      pageSize.value = result.pageSize
    } catch (error) {
      notifyApiError(error, 'بارگذاری برندها ناموفق بود')
    } finally {
      loading.value = false
    }
  }

  async function create(dto: CreateProductBrandDto): Promise<ProductBrand | null> {
    saving.value = true
    try {
      const created = await productBrandsApi.create(dto)
      message.success('برند ایجاد شد')
      await fetchPage({ page: 1, pageSize: pageSize.value })
      return created
    } catch (error) {
      notifyApiError(error, 'ایجاد برند ناموفق بود')
      return null
    } finally {
      saving.value = false
    }
  }

  async function update(
    id: string,
    dto: UpdateProductBrandDto,
  ): Promise<ProductBrand | null> {
    saving.value = true
    try {
      const updated = await productBrandsApi.update(id, dto)
      message.success('برند به‌روزرسانی شد')
      await fetchPage()
      return updated
    } catch (error) {
      notifyApiError(error, 'به‌روزرسانی برند ناموفق بود')
      return null
    } finally {
      saving.value = false
    }
  }

  async function remove(id: string): Promise<boolean> {
    saving.value = true
    try {
      await productBrandsApi.remove(id)
      message.success('برند حذف شد')
      await fetchPage()
      return true
    } catch (error) {
      notifyApiError(error, 'حذف برند ناموفق بود')
      return false
    } finally {
      saving.value = false
    }
  }

  return {
    brandList,
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
