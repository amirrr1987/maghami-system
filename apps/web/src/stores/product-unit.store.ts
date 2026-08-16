import { message } from 'ant-design-vue'
import type {
  CreateProductUnitDto,
  PaginationQuery,
  UpdateProductUnitDto,
} from '@maghami-system/schemas'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { productUnitsApi } from '@/api/product-units.api'
import type { ProductUnit } from '@/api/types'
import { notifyApiError } from './notify-api-error'

export const useProductUnitStore = defineStore('productUnit', () => {
  const unitList = ref<ProductUnit[]>([])
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
      const result = await productUnitsApi.list(query)
      unitList.value = result.items
      total.value = result.total
      page.value = result.page
      pageSize.value = result.pageSize
    } catch (error) {
      notifyApiError(error, 'بارگذاری واحدها ناموفق بود')
    } finally {
      loading.value = false
    }
  }

  async function create(dto: CreateProductUnitDto): Promise<ProductUnit | null> {
    saving.value = true
    try {
      const created = await productUnitsApi.create(dto)
      message.success('واحد ایجاد شد')
      await fetchPage({ page: 1, pageSize: pageSize.value })
      return created
    } catch (error) {
      notifyApiError(error, 'ایجاد واحد ناموفق بود')
      return null
    } finally {
      saving.value = false
    }
  }

  async function update(
    id: string,
    dto: UpdateProductUnitDto,
  ): Promise<ProductUnit | null> {
    saving.value = true
    try {
      const updated = await productUnitsApi.update(id, dto)
      message.success('واحد به‌روزرسانی شد')
      await fetchPage()
      return updated
    } catch (error) {
      notifyApiError(error, 'به‌روزرسانی واحد ناموفق بود')
      return null
    } finally {
      saving.value = false
    }
  }

  async function remove(id: string): Promise<boolean> {
    saving.value = true
    try {
      await productUnitsApi.remove(id)
      message.success('واحد حذف شد')
      await fetchPage()
      return true
    } catch (error) {
      notifyApiError(error, 'حذف واحد ناموفق بود')
      return false
    } finally {
      saving.value = false
    }
  }

  return {
    unitList,
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
