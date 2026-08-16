import { message } from 'ant-design-vue'
import type {
  CreateProductCategoryDto,
  PaginationQuery,
  UpdateProductCategoryDto,
} from '@maghami-system/schemas'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { productCategoriesApi } from '@/api/product-categories.api'
import type { ProductCategory, ProductCategoryTreeNode } from '@/api/types'
import { notifyApiError } from './notify-api-error'

export const useProductCategoryStore = defineStore('productCategory', () => {
  const categoryList = ref<ProductCategory[]>([])
  const tree = ref<ProductCategoryTreeNode[]>([])
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
      const result = await productCategoriesApi.list(query)
      categoryList.value = result.items
      total.value = result.total
      page.value = result.page
      pageSize.value = result.pageSize
    } catch (error) {
      notifyApiError(error, 'بارگذاری دسته‌بندی‌ها ناموفق بود')
    } finally {
      loading.value = false
    }
  }

  async function fetchTree(): Promise<void> {
    loading.value = true
    try {
      tree.value = await productCategoriesApi.tree()
    } catch (error) {
      notifyApiError(error, 'بارگذاری درخت دسته‌بندی ناموفق بود')
    } finally {
      loading.value = false
    }
  }

  async function create(
    dto: CreateProductCategoryDto,
  ): Promise<ProductCategory | null> {
    saving.value = true
    try {
      const created = await productCategoriesApi.create(dto)
      message.success('دسته‌بندی ایجاد شد')
      await Promise.all([
        fetchPage({ page: 1, pageSize: pageSize.value }),
        fetchTree(),
      ])
      return created
    } catch (error) {
      notifyApiError(error, 'ایجاد دسته‌بندی ناموفق بود')
      return null
    } finally {
      saving.value = false
    }
  }

  async function update(
    id: string,
    dto: UpdateProductCategoryDto,
  ): Promise<ProductCategory | null> {
    saving.value = true
    try {
      const updated = await productCategoriesApi.update(id, dto)
      message.success('دسته‌بندی به‌روزرسانی شد')
      await Promise.all([fetchPage(), fetchTree()])
      return updated
    } catch (error) {
      notifyApiError(error, 'به‌روزرسانی دسته‌بندی ناموفق بود')
      return null
    } finally {
      saving.value = false
    }
  }

  async function remove(id: string): Promise<boolean> {
    saving.value = true
    try {
      await productCategoriesApi.remove(id)
      message.success('دسته‌بندی حذف شد')
      await Promise.all([fetchPage(), fetchTree()])
      return true
    } catch (error) {
      notifyApiError(error, 'حذف دسته‌بندی ناموفق بود')
      return false
    } finally {
      saving.value = false
    }
  }

  return {
    categoryList,
    tree,
    total,
    page,
    pageSize,
    loading,
    saving,
    fetchPage,
    fetchTree,
    create,
    update,
    remove,
  }
})
