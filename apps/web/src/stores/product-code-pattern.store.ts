import { message } from 'ant-design-vue'
import type {
  CreateProductCodePatternDto,
  PaginationQuery,
  UpdateProductCodePatternDto,
} from '@maghami-system/schemas'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { productCodePatternsApi } from '@/api/product-code-patterns.api'
import type { ProductCodePattern } from '@/api/types'
import { notifyApiError } from './notify-api-error'

export const useProductCodePatternStore = defineStore(
  'productCodePattern',
  () => {
    const patternList = ref<ProductCodePattern[]>([])
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
        const result = await productCodePatternsApi.list(query)
        patternList.value = result.items
        total.value = result.total
        page.value = result.page
        pageSize.value = result.pageSize
      } catch (error) {
        notifyApiError(error, 'بارگذاری الگوهای کدینگ ناموفق بود')
      } finally {
        loading.value = false
      }
    }

    async function create(
      dto: CreateProductCodePatternDto,
    ): Promise<ProductCodePattern | null> {
      saving.value = true
      try {
        const created = await productCodePatternsApi.create(dto)
        message.success('الگوی کدینگ ایجاد شد')
        await fetchPage({ page: 1, pageSize: pageSize.value })
        return created
      } catch (error) {
        notifyApiError(error, 'ایجاد الگوی کدینگ ناموفق بود')
        return null
      } finally {
        saving.value = false
      }
    }

    async function update(
      id: string,
      dto: UpdateProductCodePatternDto,
    ): Promise<ProductCodePattern | null> {
      saving.value = true
      try {
        const updated = await productCodePatternsApi.update(id, dto)
        message.success('الگوی کدینگ به‌روزرسانی شد')
        await fetchPage()
        return updated
      } catch (error) {
        notifyApiError(error, 'به‌روزرسانی الگوی کدینگ ناموفق بود')
        return null
      } finally {
        saving.value = false
      }
    }

    async function remove(id: string): Promise<boolean> {
      saving.value = true
      try {
        await productCodePatternsApi.remove(id)
        message.success('الگوی کدینگ حذف شد')
        await fetchPage()
        return true
      } catch (error) {
        notifyApiError(error, 'حذف الگوی کدینگ ناموفق بود')
        return false
      } finally {
        saving.value = false
      }
    }

    return {
      patternList,
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
  },
)
