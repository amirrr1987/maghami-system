import { message } from 'ant-design-vue'
import type {
  CreateFileFolderDto,
  FileFolderDto,
  FileStats,
  FilesListQuery,
  StorageInfo,
  StoredFile,
  UpdateFileFolderDto,
  UpdateFileMetaDto,
} from '@maghami-system/schemas'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { filesApi } from '@/api/files.api'
import { ApiError } from '@/api/types'

function notifyError(error: unknown, fallback: string): void {
  if (error instanceof ApiError) {
    message.error(error.message)
    return
  }
  message.error(fallback)
}

export const useFileStore = defineStore('file', () => {
  const fileList = ref<StoredFile[]>([])
  const folders = ref<FileFolderDto[]>([])
  /** null = root */
  const currentFolderId = ref<string | null>(null)
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(48)
  const search = ref('')
  const loading = ref(false)
  const saving = ref(false)
  const storage = ref<StorageInfo | null>(null)
  const stats = ref<FileStats | null>(null)
  const selectedIds = ref<string[]>([])

  function currentQuery(): FilesListQuery {
    return {
      page: page.value,
      pageSize: pageSize.value,
      q: search.value.trim() || undefined,
      folderId: currentFolderId.value,
    }
  }

  async function fetchStorage(): Promise<void> {
    try {
      storage.value = await filesApi.storage()
    } catch {
      storage.value = null
    }
  }

  async function fetchStats(): Promise<void> {
    try {
      stats.value = await filesApi.stats()
    } catch {
      stats.value = null
    }
  }

  async function fetchFolders(): Promise<void> {
    try {
      folders.value = await filesApi.listFolders()
    } catch (error) {
      notifyError(error, 'بارگذاری پوشه‌ها ناموفق بود')
    }
  }

  async function fetchPage(
    query: FilesListQuery = currentQuery(),
  ): Promise<void> {
    loading.value = true
    try {
      const result = await filesApi.list(query)
      fileList.value = result.items
      total.value = result.total
      page.value = result.page
      pageSize.value = result.pageSize
      const visible = new Set(result.items.map((row) => row.id))
      selectedIds.value = selectedIds.value.filter((id) => visible.has(id))
    } catch (error) {
      notifyError(error, 'بارگذاری فایل‌ها ناموفق بود')
    } finally {
      loading.value = false
    }
  }

  async function selectFolder(folderId: string | null): Promise<void> {
    currentFolderId.value = folderId
    search.value = ''
    selectedIds.value = []
    await fetchPage({
      page: 1,
      pageSize: pageSize.value,
      folderId,
    })
  }

  function toggleSelected(id: string): void {
    if (selectedIds.value.includes(id)) {
      selectedIds.value = selectedIds.value.filter((row) => row !== id)
      return
    }
    selectedIds.value = [...selectedIds.value, id]
  }

  function clearSelection(): void {
    selectedIds.value = []
  }

  async function createFolder(dto: CreateFileFolderDto): Promise<boolean> {
    saving.value = true
    try {
      await filesApi.createFolder(dto)
      message.success('پوشه ایجاد شد')
      await Promise.all([fetchFolders(), fetchStats()])
      return true
    } catch (error) {
      notifyError(error, 'ایجاد پوشه ناموفق بود')
      return false
    } finally {
      saving.value = false
    }
  }

  async function renameFolder(
    id: string,
    dto: UpdateFileFolderDto,
  ): Promise<boolean> {
    saving.value = true
    try {
      await filesApi.updateFolder(id, dto)
      message.success('پوشه به‌روز شد')
      await fetchFolders()
      return true
    } catch (error) {
      notifyError(error, 'ویرایش پوشه ناموفق بود')
      return false
    } finally {
      saving.value = false
    }
  }

  async function removeFolder(id: string): Promise<boolean> {
    saving.value = true
    try {
      const parentId =
        folders.value.find((folder) => folder.id === id)?.parentId ?? null
      await filesApi.removeFolder(id)
      message.success('پوشه حذف شد')
      if (currentFolderId.value === id) {
        currentFolderId.value = parentId
      }
      await Promise.all([fetchFolders(), fetchPage(), fetchStats()])
      return true
    } catch (error) {
      notifyError(error, 'حذف پوشه ناموفق بود')
      return false
    } finally {
      saving.value = false
    }
  }

  async function upload(
    file: File,
    meta: { title: string; alt?: string },
  ): Promise<StoredFile | null> {
    saving.value = true
    try {
      const created = await filesApi.upload(file, currentFolderId.value, meta)
      message.success('فایل آپلود شد')
      await Promise.all([
        fetchPage({
          page: 1,
          pageSize: pageSize.value,
          folderId: currentFolderId.value,
        }),
        fetchStats(),
      ])
      return created
    } catch (error) {
      notifyError(error, 'آپلود فایل ناموفق بود')
      return null
    } finally {
      saving.value = false
    }
  }

  async function updateMeta(
    id: string,
    dto: UpdateFileMetaDto,
  ): Promise<boolean> {
    saving.value = true
    try {
      await filesApi.updateMeta(id, dto)
      message.success('مشخصات فایل ذخیره شد')
      await fetchPage()
      return true
    } catch (error) {
      notifyError(error, 'ویرایش مشخصات ناموفق بود')
      return false
    } finally {
      saving.value = false
    }
  }

  async function moveFile(
    id: string,
    folderId: string | null,
  ): Promise<boolean> {
    saving.value = true
    try {
      await filesApi.move(id, { folderId })
      message.success('فایل منتقل شد')
      selectedIds.value = selectedIds.value.filter((row) => row !== id)
      await fetchPage()
      return true
    } catch (error) {
      notifyError(error, 'انتقال فایل ناموفق بود')
      return false
    } finally {
      saving.value = false
    }
  }

  async function reorder(fileIds: string[]): Promise<void> {
    try {
      await filesApi.reorder({
        folderId: currentFolderId.value,
        fileIds,
      })
    } catch (error) {
      notifyError(error, 'مرتب‌سازی ناموفق بود')
      await fetchPage()
    }
  }

  async function remove(id: string): Promise<boolean> {
    saving.value = true
    try {
      await filesApi.remove(id)
      message.success('فایل حذف شد')
      selectedIds.value = selectedIds.value.filter((row) => row !== id)
      await Promise.all([fetchPage(), fetchStats()])
      return true
    } catch (error) {
      notifyError(error, 'حذف فایل ناموفق بود')
      return false
    } finally {
      saving.value = false
    }
  }

  async function bulkRemove(ids: string[]): Promise<boolean> {
    if (ids.length === 0) return false
    saving.value = true
    try {
      const result = await filesApi.bulkRemove({ ids })
      message.success(`${result.deleted} فایل حذف شد`)
      selectedIds.value = []
      await Promise.all([fetchPage(), fetchStats()])
      return true
    } catch (error) {
      notifyError(error, 'حذف گروهی ناموفق بود')
      return false
    } finally {
      saving.value = false
    }
  }

  return {
    fileList,
    folders,
    currentFolderId,
    total,
    page,
    pageSize,
    search,
    loading,
    saving,
    storage,
    stats,
    selectedIds,
    fetchStorage,
    fetchStats,
    fetchFolders,
    fetchPage,
    selectFolder,
    toggleSelected,
    clearSelection,
    createFolder,
    renameFolder,
    removeFolder,
    upload,
    updateMeta,
    moveFile,
    reorder,
    remove,
    bulkRemove,
  }
})
