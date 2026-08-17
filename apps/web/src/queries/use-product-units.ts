import { message } from 'ant-design-vue'
import type {
  CreateProductUnitDto,
  PaginationQuery,
  UpdateProductUnitDto,
} from '@maghami-system/schemas'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, reactive, ref, toValue, type MaybeRefOrGetter } from 'vue'
import { productUnitsApi } from '@/api/product-units.api'
import { notifyApiError } from '@/api/notify-api-error'
import { queryKeys } from '@/query/keys'
import { tryMutate, tryMutateOk } from '@/query/try-mutate'

export function useProductUnits(options?: {
  pageSize?: number
  enabled?: MaybeRefOrGetter<boolean>
}) {
  const queryClient = useQueryClient()
  const page = ref(1)
  const pageSize = ref(options?.pageSize ?? 10)

  const listQuery = useQuery({
    queryKey: computed(() =>
      queryKeys.productUnits.list({
        page: page.value,
        pageSize: pageSize.value,
      }),
    ),
    queryFn: () =>
      productUnitsApi.list({ page: page.value, pageSize: pageSize.value }),
    enabled: () => toValue(options?.enabled) ?? true,
    meta: { errorMessage: 'بارگذاری واحدها ناموفق بود' },
  })

  const createMutation = useMutation({
    mutationFn: (dto: CreateProductUnitDto) => productUnitsApi.create(dto),
    onSuccess: async () => {
      message.success('واحد ایجاد شد')
      page.value = 1
      await queryClient.invalidateQueries({
        queryKey: queryKeys.productUnits.all,
      })
    },
    onError: (error) => notifyApiError(error, 'ایجاد واحد ناموفق بود'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProductUnitDto }) =>
      productUnitsApi.update(id, dto),
    onSuccess: async () => {
      message.success('واحد به‌روزرسانی شد')
      await queryClient.invalidateQueries({
        queryKey: queryKeys.productUnits.all,
      })
    },
    onError: (error) => notifyApiError(error, 'به‌روزرسانی واحد ناموفق بود'),
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => productUnitsApi.remove(id),
    onSuccess: async () => {
      message.success('واحد حذف شد')
      await queryClient.invalidateQueries({
        queryKey: queryKeys.productUnits.all,
      })
    },
    onError: (error) => notifyApiError(error, 'حذف واحد ناموفق بود'),
  })

  const unitList = computed(() => listQuery.data.value?.items ?? [])
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
    unitList,
    total,
    page,
    pageSize,
    loading,
    saving,
    fetchPage,
    create: (dto: CreateProductUnitDto) =>
      tryMutate(createMutation.mutateAsync(dto)),
    update: (id: string, dto: UpdateProductUnitDto) =>
      tryMutate(updateMutation.mutateAsync({ id, dto })),
    remove: (id: string) => tryMutateOk(removeMutation.mutateAsync(id)),
  })
}
