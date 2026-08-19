import { message } from 'ant-design-vue'
import type {
  CreatePermissionDto,
  PaginationQuery,
  UpdatePermissionDto,
} from '@maghami-system/schemas'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, reactive, ref } from 'vue'
import { notifyApiError } from '@/api/notify-api-error'
import { permissionToOption, toSelectOptions } from '@/utils/select-options'
import { queryKeys } from '@/query/keys'
import { tryMutate, tryMutateOk } from '@/query/try-mutate'
import { permissionsApi } from '@/modules/permissions/api/permissions.api'

export function usePermissions() {
  const queryClient = useQueryClient()
  const page = ref(1)
  const pageSize = ref(5)

  const listQuery = useQuery({
    queryKey: computed(() =>
      queryKeys.permissions.list({
        page: page.value,
        pageSize: pageSize.value,
      }),
    ),
    queryFn: () => permissionsApi.list({ page: page.value, pageSize: pageSize.value }),
    meta: { errorMessage: 'بارگذاری مجوزها ناموفق بود' },
  })

  const createMutation = useMutation({
    mutationFn: (dto: CreatePermissionDto) => permissionsApi.create(dto),
    onSuccess: async () => {
      message.success('مجوز ایجاد شد')
      page.value = 1
      await queryClient.invalidateQueries({
        queryKey: queryKeys.permissions.all,
      })
    },
    onError: (error) => notifyApiError(error, 'ایجاد مجوز ناموفق بود'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePermissionDto }) =>
      permissionsApi.update(id, dto),
    onSuccess: async () => {
      message.success('مجوز به‌روزرسانی شد')
      await queryClient.invalidateQueries({
        queryKey: queryKeys.permissions.all,
      })
    },
    onError: (error) => notifyApiError(error, 'به‌روزرسانی مجوز ناموفق بود'),
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => permissionsApi.remove(id),
    onSuccess: async () => {
      message.success('مجوز حذف شد')
      await queryClient.invalidateQueries({
        queryKey: queryKeys.permissions.all,
      })
    },
    onError: (error) => notifyApiError(error, 'حذف مجوز ناموفق بود'),
  })

  const permissionList = computed(() => listQuery.data.value?.items ?? [])
  const total = computed(() => listQuery.data.value?.total ?? 0)
  const loading = computed(() => listQuery.isFetching.value)
  const saving = computed(
    () =>
      createMutation.isPending.value ||
      updateMutation.isPending.value ||
      removeMutation.isPending.value,
  )

  function fetchPage(query: PaginationQuery): Promise<void> {
    page.value = query.page
    pageSize.value = query.pageSize
    return Promise.resolve()
  }

  return reactive({
    permissionList,
    total,
    page,
    pageSize,
    loading,
    saving,
    fetchPage,
    create: (dto: CreatePermissionDto) => tryMutate(createMutation.mutateAsync(dto)),
    update: (id: string, dto: UpdatePermissionDto) =>
      tryMutate(updateMutation.mutateAsync({ id, dto })),
    remove: (id: string) => tryMutateOk(removeMutation.mutateAsync(id)),
  })
}

export function usePermissionOptions() {
  const optionsQuery = useQuery({
    queryKey: queryKeys.permissions.options,
    queryFn: () => permissionsApi.list({ page: 1, pageSize: 100 }),
    meta: { errorMessage: 'بارگذاری گزینه‌های مجوز ناموفق بود' },
  })

  const permissionOptions = computed(() =>
    toSelectOptions(
      (optionsQuery.data.value?.items ?? []).map((permission) => permissionToOption(permission)),
    ),
  )

  return { permissionOptions }
}
