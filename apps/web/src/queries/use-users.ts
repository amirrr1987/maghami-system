import { message } from 'ant-design-vue'
import type { CreateUserDto, PaginationQuery, UpdateUserDto } from '@maghami-system/schemas'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, reactive, ref } from 'vue'
import { usersApi } from '@/api/users.api'
import { notifyApiError } from '@/api/notify-api-error'
import { queryKeys } from '@/query/keys'
import { tryMutate, tryMutateOk } from '@/query/try-mutate'

export function useUsers() {
  const queryClient = useQueryClient()
  const page = ref(1)
  const pageSize = ref(5)

  const listQuery = useQuery({
    queryKey: computed(() => queryKeys.users.list({ page: page.value, pageSize: pageSize.value })),
    queryFn: () => usersApi.list({ page: page.value, pageSize: pageSize.value }),
    meta: { errorMessage: 'بارگذاری کاربران ناموفق بود' },
  })

  const createMutation = useMutation({
    mutationFn: (dto: CreateUserDto) => usersApi.create(dto),
    onSuccess: async () => {
      message.success('کاربر ایجاد شد')
      page.value = 1
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
    },
    onError: (error) => notifyApiError(error, 'ایجاد کاربر ناموفق بود'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateUserDto }) => usersApi.update(id, dto),
    onSuccess: async () => {
      message.success('کاربر به‌روزرسانی شد')
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
    },
    onError: (error) => notifyApiError(error, 'به‌روزرسانی کاربر ناموفق بود'),
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: async () => {
      message.success('کاربر حذف شد')
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
    },
    onError: (error) => notifyApiError(error, 'حذف کاربر ناموفق بود'),
  })

  const userList = computed(() => listQuery.data.value?.items ?? [])
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
    userList,
    total,
    page,
    pageSize,
    loading,
    saving,
    fetchPage,
    create: (dto: CreateUserDto) => tryMutate(createMutation.mutateAsync(dto)),
    update: (id: string, dto: UpdateUserDto) => tryMutate(updateMutation.mutateAsync({ id, dto })),
    remove: (id: string) => tryMutateOk(removeMutation.mutateAsync(id)),
  })
}
