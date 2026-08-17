import { message } from 'ant-design-vue'
import type {
  CreateProductCodePatternDto,
  PaginationQuery,
  UpdateProductCodePatternDto,
} from '@maghami-system/schemas'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, reactive, ref } from 'vue'
import { productCodePatternsApi } from '@/api/product-code-patterns.api'
import { notifyApiError } from '@/api/notify-api-error'
import { queryKeys } from '@/query/keys'
import { tryMutate, tryMutateOk } from '@/query/try-mutate'

export function useProductCodePatterns() {
  const queryClient = useQueryClient()
  const page = ref(1)
  const pageSize = ref(10)

  const listQuery = useQuery({
    queryKey: computed(() =>
      queryKeys.productCodePatterns.list({
        page: page.value,
        pageSize: pageSize.value,
      }),
    ),
    queryFn: () =>
      productCodePatternsApi.list({
        page: page.value,
        pageSize: pageSize.value,
      }),
    meta: { errorMessage: 'بارگذاری الگوهای کدینگ ناموفق بود' },
  })

  const createMutation = useMutation({
    mutationFn: (dto: CreateProductCodePatternDto) =>
      productCodePatternsApi.create(dto),
    onSuccess: async () => {
      message.success('الگوی کدینگ ایجاد شد')
      page.value = 1
      await queryClient.invalidateQueries({
        queryKey: queryKeys.productCodePatterns.all,
      })
    },
    onError: (error) => notifyApiError(error, 'ایجاد الگوی کدینگ ناموفق بود'),
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string
      dto: UpdateProductCodePatternDto
    }) => productCodePatternsApi.update(id, dto),
    onSuccess: async () => {
      message.success('الگوی کدینگ به‌روزرسانی شد')
      await queryClient.invalidateQueries({
        queryKey: queryKeys.productCodePatterns.all,
      })
    },
    onError: (error) =>
      notifyApiError(error, 'به‌روزرسانی الگوی کدینگ ناموفق بود'),
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => productCodePatternsApi.remove(id),
    onSuccess: async () => {
      message.success('الگوی کدینگ حذف شد')
      await queryClient.invalidateQueries({
        queryKey: queryKeys.productCodePatterns.all,
      })
    },
    onError: (error) => notifyApiError(error, 'حذف الگوی کدینگ ناموفق بود'),
  })

  const patternList = computed(() => listQuery.data.value?.items ?? [])
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
    patternList,
    total,
    page,
    pageSize,
    loading,
    saving,
    fetchPage,
    create: (dto: CreateProductCodePatternDto) =>
      tryMutate(createMutation.mutateAsync(dto)),
    update: (id: string, dto: UpdateProductCodePatternDto) =>
      tryMutate(updateMutation.mutateAsync({ id, dto })),
    remove: (id: string) => tryMutateOk(removeMutation.mutateAsync(id)),
  })
}
