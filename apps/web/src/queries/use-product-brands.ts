import { message } from 'ant-design-vue'
import type {
  CreateProductBrandDto,
  PaginationQuery,
  UpdateProductBrandDto,
} from '@maghami-system/schemas'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, reactive, ref, toValue, type MaybeRefOrGetter } from 'vue'
import { productBrandsApi } from '@/api/product-brands.api'
import { notifyApiError } from '@/api/notify-api-error'
import { queryKeys } from '@/query/keys'
import { tryMutate, tryMutateOk } from '@/query/try-mutate'

export function useProductBrands(options?: {
  pageSize?: number
  enabled?: MaybeRefOrGetter<boolean>
}) {
  const queryClient = useQueryClient()
  const page = ref(1)
  const pageSize = ref(options?.pageSize ?? 10)

  const listQuery = useQuery({
    queryKey: computed(() =>
      queryKeys.productBrands.list({
        page: page.value,
        pageSize: pageSize.value,
      }),
    ),
    queryFn: () => productBrandsApi.list({ page: page.value, pageSize: pageSize.value }),
    enabled: () => toValue(options?.enabled) ?? true,
    meta: { errorMessage: 'بارگذاری برندها ناموفق بود' },
  })

  const createMutation = useMutation({
    mutationFn: (dto: CreateProductBrandDto) => productBrandsApi.create(dto),
    onSuccess: async () => {
      message.success('برند ایجاد شد')
      page.value = 1
      await queryClient.invalidateQueries({
        queryKey: queryKeys.productBrands.all,
      })
    },
    onError: (error) => notifyApiError(error, 'ایجاد برند ناموفق بود'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProductBrandDto }) =>
      productBrandsApi.update(id, dto),
    onSuccess: async () => {
      message.success('برند به‌روزرسانی شد')
      await queryClient.invalidateQueries({
        queryKey: queryKeys.productBrands.all,
      })
    },
    onError: (error) => notifyApiError(error, 'به‌روزرسانی برند ناموفق بود'),
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => productBrandsApi.remove(id),
    onSuccess: async () => {
      message.success('برند حذف شد')
      await queryClient.invalidateQueries({
        queryKey: queryKeys.productBrands.all,
      })
    },
    onError: (error) => notifyApiError(error, 'حذف برند ناموفق بود'),
  })

  const brandList = computed(() => listQuery.data.value?.items ?? [])
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
    brandList,
    total,
    page,
    pageSize,
    loading,
    saving,
    fetchPage,
    create: (dto: CreateProductBrandDto) => tryMutate(createMutation.mutateAsync(dto)),
    update: (id: string, dto: UpdateProductBrandDto) =>
      tryMutate(updateMutation.mutateAsync({ id, dto })),
    remove: (id: string) => tryMutateOk(removeMutation.mutateAsync(id)),
  })
}
