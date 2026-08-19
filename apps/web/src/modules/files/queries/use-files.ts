import { message } from 'ant-design-vue'
import type {
  CreateFileFolderDto,
  FilesListQuery,
  UpdateFileFolderDto,
  UpdateFileMetaDto,
} from '@maghami-system/schemas'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, reactive, ref } from 'vue'
import { notifyApiError } from '@/api/notify-api-error'
import { queryKeys } from '@/query/keys'
import { tryMutate, tryMutateOk } from '@/query/try-mutate'
import { filesApi } from '@/modules/files/api/files.api'

export function useFiles() {
  const queryClient = useQueryClient()
  const currentFolderId = ref<string | null>(null)
  const page = ref(1)
  const pageSize = ref(48)
  const search = ref('')
  const selectedIds = ref<string[]>([])

  const listQuery = useQuery({
    queryKey: computed(() =>
      queryKeys.files.list({
        page: page.value,
        pageSize: pageSize.value,
        q: search.value.trim() || undefined,
        folderId: currentFolderId.value,
      }),
    ),
    queryFn: () =>
      filesApi.list({
        page: page.value,
        pageSize: pageSize.value,
        q: search.value.trim() || undefined,
        folderId: currentFolderId.value,
      }),
    meta: { errorMessage: 'بارگذاری فایل‌ها ناموفق بود' },
  })

  const foldersQuery = useQuery({
    queryKey: queryKeys.files.folders,
    queryFn: () => filesApi.listFolders(),
    meta: { errorMessage: 'بارگذاری پوشه‌ها ناموفق بود' },
  })

  const statsQuery = useQuery({
    queryKey: queryKeys.files.stats,
    queryFn: () => filesApi.stats(),
    meta: { errorMessage: 'بارگذاری آمار فایل‌ها ناموفق بود' },
  })

  async function invalidateFiles(): Promise<void> {
    await queryClient.invalidateQueries({ queryKey: queryKeys.files.all })
  }

  const createFolderMutation = useMutation({
    mutationFn: (dto: CreateFileFolderDto) => filesApi.createFolder(dto),
    onSuccess: async () => {
      message.success('پوشه ایجاد شد')
      await invalidateFiles()
    },
    onError: (error) => notifyApiError(error, 'ایجاد پوشه ناموفق بود'),
  })

  const renameFolderMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateFileFolderDto }) =>
      filesApi.updateFolder(id, dto),
    onSuccess: async () => {
      message.success('پوشه به‌روز شد')
      await queryClient.invalidateQueries({
        queryKey: queryKeys.files.folders,
      })
    },
    onError: (error) => notifyApiError(error, 'ویرایش پوشه ناموفق بود'),
  })

  const removeFolderMutation = useMutation({
    mutationFn: (id: string) => filesApi.removeFolder(id),
    onSuccess: async () => {
      message.success('پوشه حذف شد')
      await invalidateFiles()
    },
    onError: (error) => notifyApiError(error, 'حذف پوشه ناموفق بود'),
  })

  const uploadMutation = useMutation({
    mutationFn: ({ file, meta }: { file: File; meta: { title: string; alt?: string } }) =>
      filesApi.upload(file, currentFolderId.value, meta),
    onSuccess: async () => {
      message.success('فایل آپلود شد')
      page.value = 1
      await invalidateFiles()
    },
    onError: (error) => notifyApiError(error, 'آپلود فایل ناموفق بود'),
  })

  const updateMetaMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateFileMetaDto }) =>
      filesApi.updateMeta(id, dto),
    onSuccess: async () => {
      message.success('مشخصات فایل ذخیره شد')
      await queryClient.invalidateQueries({ queryKey: queryKeys.files.all })
    },
    onError: (error) => notifyApiError(error, 'ویرایش مشخصات ناموفق بود'),
  })

  const moveMutation = useMutation({
    mutationFn: ({ id, folderId }: { id: string; folderId: string | null }) =>
      filesApi.move(id, { folderId }),
    onSuccess: async (_data, variables) => {
      message.success('فایل منتقل شد')
      selectedIds.value = selectedIds.value.filter((row) => row !== variables.id)
      await invalidateFiles()
    },
    onError: (error) => notifyApiError(error, 'انتقال فایل ناموفق بود'),
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => filesApi.remove(id),
    onSuccess: async (_data, id) => {
      message.success('فایل حذف شد')
      selectedIds.value = selectedIds.value.filter((row) => row !== id)
      await invalidateFiles()
    },
    onError: (error) => notifyApiError(error, 'حذف فایل ناموفق بود'),
  })

  const bulkRemoveMutation = useMutation({
    mutationFn: (ids: string[]) => filesApi.bulkRemove({ ids }),
    onSuccess: async (result) => {
      message.success(`${result.deleted} فایل حذف شد`)
      selectedIds.value = []
      await invalidateFiles()
    },
    onError: (error) => notifyApiError(error, 'حذف گروهی ناموفق بود'),
  })

  const fileList = computed(() => listQuery.data.value?.items ?? [])
  const folders = computed(() => foldersQuery.data.value ?? [])
  const stats = computed(() => statsQuery.data.value ?? null)
  const total = computed(() => listQuery.data.value?.total ?? 0)
  const loading = computed(
    () =>
      listQuery.isFetching.value || foldersQuery.isFetching.value || statsQuery.isFetching.value,
  )
  const saving = computed(
    () =>
      createFolderMutation.isPending.value ||
      renameFolderMutation.isPending.value ||
      removeFolderMutation.isPending.value ||
      uploadMutation.isPending.value ||
      updateMetaMutation.isPending.value ||
      moveMutation.isPending.value ||
      removeMutation.isPending.value ||
      bulkRemoveMutation.isPending.value,
  )

  function fetchPage(query: FilesListQuery): Promise<void> {
    page.value = query.page
    pageSize.value = query.pageSize
    if (query.q !== undefined) search.value = query.q ?? ''
    if (query.folderId !== undefined) currentFolderId.value = query.folderId
    return Promise.resolve()
  }

  function selectFolder(folderId: string | null): Promise<void> {
    currentFolderId.value = folderId
    search.value = ''
    page.value = 1
    selectedIds.value = []
    return Promise.resolve()
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

  async function removeFolder(id: string): Promise<boolean> {
    const parentId = folders.value.find((folder) => folder.id === id)?.parentId ?? null
    const ok = await tryMutateOk(removeFolderMutation.mutateAsync(id))
    if (ok && currentFolderId.value === id) {
      currentFolderId.value = parentId
    }
    return ok
  }

  return reactive({
    fileList,
    folders,
    currentFolderId,
    total,
    page,
    pageSize,
    search,
    loading,
    saving,
    stats,
    selectedIds,
    fetchPage,
    selectFolder,
    toggleSelected,
    clearSelection,
    createFolder: (dto: CreateFileFolderDto) => tryMutateOk(createFolderMutation.mutateAsync(dto)),
    renameFolder: (id: string, dto: UpdateFileFolderDto) =>
      tryMutateOk(renameFolderMutation.mutateAsync({ id, dto })),
    removeFolder,
    upload: (file: File, meta: { title: string; alt?: string }) =>
      tryMutate(uploadMutation.mutateAsync({ file, meta })),
    updateMeta: (id: string, dto: UpdateFileMetaDto) =>
      tryMutateOk(updateMetaMutation.mutateAsync({ id, dto })),
    moveFile: (id: string, folderId: string | null) =>
      tryMutateOk(moveMutation.mutateAsync({ id, folderId })),
    remove: (id: string) => tryMutateOk(removeMutation.mutateAsync(id)),
    bulkRemove: (ids: string[]) =>
      ids.length === 0 ? Promise.resolve(false) : tryMutateOk(bulkRemoveMutation.mutateAsync(ids)),
  })
}
