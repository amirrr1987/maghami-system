import { message } from 'ant-design-vue'
import type {
  CreatePermissionDto,
  PaginationQuery,
  UpdatePermissionDto,
} from '@maghami-system/schemas'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { permissionsApi } from '@/api/permissions.api'
import { ApiError } from '@/api/types'
import type { Permission } from '@/api/types'
import {
  permissionToOption,
  toSelectOptions,
} from '@/utils/select-options'

function notifyError(error: unknown, fallback: string): void {
  if (error instanceof ApiError) {
    message.error(error.message)
    return
  }
  message.error(fallback)
}

export const usePermissionStore = defineStore('permission', () => {
  const permissionList = ref<Permission[]>([])
  const optionPermissions = ref<Permission[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(5)
  const loading = ref(false)
  const saving = ref(false)

  const permissionOptions = computed(() =>
    toSelectOptions(
      optionPermissions.value.map((permission) =>
        permissionToOption(permission),
      ),
    ),
  )

  async function fetchPage(
    query: PaginationQuery = { page: page.value, pageSize: pageSize.value },
  ): Promise<void> {
    loading.value = true
    try {
      const result = await permissionsApi.list(query)
      permissionList.value = result.items
      total.value = result.total
      page.value = result.page
      pageSize.value = result.pageSize
    } catch (error) {
      notifyError(error, 'بارگذاری مجوزها ناموفق بود')
    } finally {
      loading.value = false
    }
  }

  async function fetchOptions(): Promise<void> {
    try {
      const result = await permissionsApi.list({ page: 1, pageSize: 100 })
      optionPermissions.value = result.items
    } catch (error) {
      notifyError(error, 'بارگذاری گزینه‌های مجوز ناموفق بود')
    }
  }

  async function create(
    dto: CreatePermissionDto,
  ): Promise<Permission | null> {
    saving.value = true
    try {
      const created = await permissionsApi.create(dto)
      message.success('مجوز ایجاد شد')
      await Promise.all([
        fetchPage({ page: 1, pageSize: pageSize.value }),
        fetchOptions(),
      ])
      return created
    } catch (error) {
      notifyError(error, 'ایجاد مجوز ناموفق بود')
      return null
    } finally {
      saving.value = false
    }
  }

  async function update(
    id: string,
    dto: UpdatePermissionDto,
  ): Promise<Permission | null> {
    saving.value = true
    try {
      const updated = await permissionsApi.update(id, dto)
      message.success('مجوز به‌روزرسانی شد')
      await Promise.all([fetchPage(), fetchOptions()])
      return updated
    } catch (error) {
      notifyError(error, 'به‌روزرسانی مجوز ناموفق بود')
      return null
    } finally {
      saving.value = false
    }
  }

  async function remove(id: string): Promise<boolean> {
    saving.value = true
    try {
      await permissionsApi.remove(id)
      message.success('مجوز حذف شد')
      await Promise.all([fetchPage(), fetchOptions()])
      return true
    } catch (error) {
      notifyError(error, 'حذف مجوز ناموفق بود')
      return false
    } finally {
      saving.value = false
    }
  }

  return {
    permissionList,
    permissionOptions,
    total,
    page,
    pageSize,
    loading,
    saving,
    fetchPage,
    fetchOptions,
    create,
    update,
    remove,
  }
})
