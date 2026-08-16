import { message } from 'ant-design-vue'
import type {
  CreateUserDto,
  PaginationQuery,
  SetUserRolesDto,
  UpdateUserDto,
} from '@vue-nestjs-admin-template/schemas'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usersApi } from '@/api/users.api'
import { ApiError } from '@/api/types'
import type { PublicUser } from '@/api/types'

function notifyError(error: unknown, fallback: string): void {
  if (error instanceof ApiError) {
    message.error(error.message)
    return
  }
  message.error(fallback)
}

export const useUserStore = defineStore('user', () => {
  const userList = ref<PublicUser[]>([])
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
      const result = await usersApi.list(query)
      userList.value = result.items
      total.value = result.total
      page.value = result.page
      pageSize.value = result.pageSize
    } catch (error) {
      notifyError(error, 'بارگذاری کاربران ناموفق بود')
    } finally {
      loading.value = false
    }
  }

  async function create(dto: CreateUserDto): Promise<PublicUser | null> {
    saving.value = true
    try {
      const created = await usersApi.create(dto)
      message.success('کاربر ایجاد شد')
      await fetchPage({ page: 1, pageSize: pageSize.value })
      return created
    } catch (error) {
      notifyError(error, 'ایجاد کاربر ناموفق بود')
      return null
    } finally {
      saving.value = false
    }
  }

  async function update(
    id: string,
    dto: UpdateUserDto,
  ): Promise<PublicUser | null> {
    saving.value = true
    try {
      const updated = await usersApi.update(id, dto)
      message.success('کاربر به‌روزرسانی شد')
      await fetchPage()
      return updated
    } catch (error) {
      notifyError(error, 'به‌روزرسانی کاربر ناموفق بود')
      return null
    } finally {
      saving.value = false
    }
  }

  async function setRoles(
    id: string,
    dto: SetUserRolesDto,
  ): Promise<PublicUser | null> {
    saving.value = true
    try {
      const updated = await usersApi.setRoles(id, dto)
      message.success('نقش‌های کاربر ذخیره شد')
      await fetchPage()
      return updated
    } catch (error) {
      notifyError(error, 'ذخیره نقش‌ها ناموفق بود')
      return null
    } finally {
      saving.value = false
    }
  }

  async function remove(id: string): Promise<boolean> {
    saving.value = true
    try {
      await usersApi.remove(id)
      message.success('کاربر حذف شد')
      await fetchPage()
      return true
    } catch (error) {
      notifyError(error, 'حذف کاربر ناموفق بود')
      return false
    } finally {
      saving.value = false
    }
  }

  return {
    userList,
    total,
    page,
    pageSize,
    loading,
    saving,
    fetchPage,
    create,
    update,
    setRoles,
    remove,
  }
})
