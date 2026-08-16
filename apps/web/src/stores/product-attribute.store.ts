import { message } from 'ant-design-vue'
import type {
  CreateProductAttributeDto,
  PaginationQuery,
  UpdateProductAttributeDto,
} from '@maghami-system/schemas'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { productAttributesApi } from '@/api/product-attributes.api'
import type { ProductAttribute } from '@/api/types'
import { notifyApiError } from './notify-api-error'

export const useProductAttributeStore = defineStore('productAttribute', () => {
  const attributeList = ref<ProductAttribute[]>([])
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
      const result = await productAttributesApi.list(query)
      attributeList.value = result.items
      total.value = result.total
      page.value = result.page
      pageSize.value = result.pageSize
    } catch (error) {
      notifyApiError(error, 'بارگذاری ویژگی‌ها ناموفق بود')
    } finally {
      loading.value = false
    }
  }

  async function create(
    dto: CreateProductAttributeDto,
  ): Promise<ProductAttribute | null> {
    saving.value = true
    try {
      const created = await productAttributesApi.create(dto)
      message.success('ویژگی ایجاد شد')
      await fetchPage({ page: 1, pageSize: pageSize.value })
      return created
    } catch (error) {
      notifyApiError(error, 'ایجاد ویژگی ناموفق بود')
      return null
    } finally {
      saving.value = false
    }
  }

  async function update(
    id: string,
    dto: UpdateProductAttributeDto,
  ): Promise<ProductAttribute | null> {
    saving.value = true
    try {
      const updated = await productAttributesApi.update(id, dto)
      message.success('ویژگی به‌روزرسانی شد')
      await fetchPage()
      return updated
    } catch (error) {
      notifyApiError(error, 'به‌روزرسانی ویژگی ناموفق بود')
      return null
    } finally {
      saving.value = false
    }
  }

  async function remove(id: string): Promise<boolean> {
    saving.value = true
    try {
      await productAttributesApi.remove(id)
      message.success('ویژگی حذف شد')
      await fetchPage()
      return true
    } catch (error) {
      notifyApiError(error, 'حذف ویژگی ناموفق بود')
      return false
    } finally {
      saving.value = false
    }
  }

  return {
    attributeList,
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
