import { message } from 'ant-design-vue'
import type {
  CreateRoleDto,
  PaginationQuery,
  SetRolePermissionsDto,
  UpdateRoleDto,
} from '@maghami-system/schemas'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, reactive, ref } from 'vue'
import { rolesApi } from '@/api/roles.api'
import { notifyApiError } from '@/api/notify-api-error'
import type { Role } from '@/api/types'
import { toSelectOptions } from '@/utils/select-options'
import { queryKeys } from '@/query/keys'
import { tryMutate, tryMutateOk } from '@/query/try-mutate'

export function useRoles() {
  const queryClient = useQueryClient()
  const page = ref(1)
  const pageSize = ref(5)

  const listQuery = useQuery({
    queryKey: computed(() => queryKeys.roles.list({ page: page.value, pageSize: pageSize.value })),
    queryFn: () => rolesApi.list({ page: page.value, pageSize: pageSize.value }),
    meta: { errorMessage: 'بارگذاری نقش‌ها ناموفق بود' },
  })

  const createMutation = useMutation({
    mutationFn: (dto: CreateRoleDto) => rolesApi.create(dto),
    onSuccess: async () => {
      message.success('نقش ایجاد شد')
      page.value = 1
      await queryClient.invalidateQueries({ queryKey: queryKeys.roles.all })
    },
    onError: (error) => notifyApiError(error, 'ایجاد نقش ناموفق بود'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: Role['value']; dto: UpdateRoleDto }) =>
      rolesApi.update(id, dto),
    onSuccess: async () => {
      message.success('نقش به‌روزرسانی شد')
      await queryClient.invalidateQueries({ queryKey: queryKeys.roles.all })
    },
    onError: (error) => notifyApiError(error, 'به‌روزرسانی نقش ناموفق بود'),
  })

  const permissionsMutation = useMutation({
    mutationFn: ({ id, dto }: { id: Role['value']; dto: SetRolePermissionsDto }) =>
      rolesApi.setPermissions(id, dto),
    onSuccess: async () => {
      message.success('مجوزهای نقش ذخیره شد')
      await queryClient.invalidateQueries({ queryKey: queryKeys.roles.all })
    },
    onError: (error) => notifyApiError(error, 'ذخیره مجوزها ناموفق بود'),
  })

  const removeMutation = useMutation({
    mutationFn: (id: Role['value']) => rolesApi.remove(id),
    onSuccess: async () => {
      message.success('نقش حذف شد')
      await queryClient.invalidateQueries({ queryKey: queryKeys.roles.all })
    },
    onError: (error) => notifyApiError(error, 'حذف نقش ناموفق بود'),
  })

  const roleList = computed(() => listQuery.data.value?.items ?? [])
  const total = computed(() => listQuery.data.value?.total ?? 0)
  const loading = computed(() => listQuery.isFetching.value)
  const saving = computed(
    () =>
      createMutation.isPending.value ||
      updateMutation.isPending.value ||
      permissionsMutation.isPending.value ||
      removeMutation.isPending.value,
  )

  function fetchPage(query: PaginationQuery): Promise<void> {
    page.value = query.page
    pageSize.value = query.pageSize
    return Promise.resolve()
  }

  return reactive({
    roleList,
    total,
    page,
    pageSize,
    loading,
    saving,
    fetchPage,
    create: (dto: CreateRoleDto) => tryMutate(createMutation.mutateAsync(dto)),
    update: (id: Role['value'], dto: UpdateRoleDto) =>
      tryMutate(updateMutation.mutateAsync({ id, dto })),
    setPermissions: (id: Role['value'], dto: SetRolePermissionsDto) =>
      tryMutate(permissionsMutation.mutateAsync({ id, dto })),
    remove: (id: Role['value']) => tryMutateOk(removeMutation.mutateAsync(id)),
  })
}

export function useRoleOptions() {
  const optionsQuery = useQuery({
    queryKey: queryKeys.roles.options,
    queryFn: () => rolesApi.list({ page: 1, pageSize: 100 }),
    meta: { errorMessage: 'بارگذاری گزینه‌های نقش ناموفق بود' },
  })

  const roleOptions = computed(() => toSelectOptions(optionsQuery.data.value?.items ?? []))

  return { roleOptions }
}
