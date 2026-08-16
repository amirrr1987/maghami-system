import { message } from 'ant-design-vue'
import type {
  CreateRoleDto,
  PaginationQuery,
  SetRolePermissionsDto,
  UpdateRoleDto,
} from '@maghami-system/schemas'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { rolesApi } from '@/api/roles.api'
import { ApiError } from '@/api/types'
import type { Role } from '@/api/types'
import { toSelectOptions } from '@/utils/select-options'

function notifyError(error: unknown, fallback: string): void {
  if (error instanceof ApiError) {
    message.error(error.message)
    return
  }
  message.error(fallback)
}

export const useRoleStore = defineStore('role', () => {
  const roleList = ref<Role[]>([])
  const optionRoles = ref<Role[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(5)
  const loading = ref(false)
  const saving = ref(false)

  const roleOptions = computed(() => toSelectOptions(optionRoles.value))

  async function fetchPage(
    query: PaginationQuery = { page: page.value, pageSize: pageSize.value },
  ): Promise<void> {
    loading.value = true
    try {
      const result = await rolesApi.list(query)
      roleList.value = result.items
      total.value = result.total
      page.value = result.page
      pageSize.value = result.pageSize
    } catch (error) {
      notifyError(error, 'بارگذاری نقش‌ها ناموفق بود')
    } finally {
      loading.value = false
    }
  }

  /** Load roles for Select options (not table page). */
  async function fetchOptions(): Promise<void> {
    try {
      const result = await rolesApi.list({ page: 1, pageSize: 100 })
      optionRoles.value = result.items
    } catch (error) {
      notifyError(error, 'بارگذاری گزینه‌های نقش ناموفق بود')
    }
  }

  async function create(dto: CreateRoleDto): Promise<Role | null> {
    saving.value = true
    try {
      const created = await rolesApi.create(dto)
      message.success('نقش ایجاد شد')
      await Promise.all([
        fetchPage({ page: 1, pageSize: pageSize.value }),
        fetchOptions(),
      ])
      return created
    } catch (error) {
      notifyError(error, 'ایجاد نقش ناموفق بود')
      return null
    } finally {
      saving.value = false
    }
  }

  async function update(
    id: Role['value'],
    dto: UpdateRoleDto,
  ): Promise<Role | null> {
    saving.value = true
    try {
      const updated = await rolesApi.update(id, dto)
      message.success('نقش به‌روزرسانی شد')
      await Promise.all([fetchPage(), fetchOptions()])
      return updated
    } catch (error) {
      notifyError(error, 'به‌روزرسانی نقش ناموفق بود')
      return null
    } finally {
      saving.value = false
    }
  }

  async function setPermissions(
    id: Role['value'],
    dto: SetRolePermissionsDto,
  ): Promise<Role | null> {
    saving.value = true
    try {
      const updated = await rolesApi.setPermissions(id, dto)
      message.success('مجوزهای نقش ذخیره شد')
      await fetchPage()
      return updated
    } catch (error) {
      notifyError(error, 'ذخیره مجوزها ناموفق بود')
      return null
    } finally {
      saving.value = false
    }
  }

  async function remove(id: Role['value']): Promise<boolean> {
    saving.value = true
    try {
      await rolesApi.remove(id)
      message.success('نقش حذف شد')
      await Promise.all([fetchPage(), fetchOptions()])
      return true
    } catch (error) {
      notifyError(error, 'حذف نقش ناموفق بود')
      return false
    } finally {
      saving.value = false
    }
  }

  return {
    roleList,
    roleOptions,
    total,
    page,
    pageSize,
    loading,
    saving,
    fetchPage,
    fetchOptions,
    create,
    update,
    setPermissions,
    remove,
  }
})
