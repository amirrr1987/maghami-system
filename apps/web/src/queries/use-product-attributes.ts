import { message } from 'ant-design-vue'
import type {
  CreateProductAttributeDto,
  PaginationQuery,
  UpdateProductAttributeDto,
} from '@maghami-system/schemas'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, reactive, ref, toValue, type MaybeRefOrGetter } from 'vue'
import { productAttributesApi } from '@/api/product-attributes.api'
import { notifyApiError } from '@/api/notify-api-error'
import { queryKeys } from '@/query/keys'
import { tryMutate, tryMutateOk } from '@/query/try-mutate'

export function useProductAttributes(options?: {
  pageSize?: number
  enabled?: MaybeRefOrGetter<boolean>
}) {
  const queryClient = useQueryClient()
  const page = ref(1)
  const pageSize = ref(options?.pageSize ?? 10)

  const listQuery = useQuery({
    queryKey: computed(() =>
      queryKeys.productAttributes.list({
        page: page.value,
        pageSize: pageSize.value,
      }),
    ),
    queryFn: () =>
      productAttributesApi.list({
        page: page.value,
        pageSize: pageSize.value,
      }),
    enabled: () => toValue(options?.enabled) ?? true,
    meta: { errorMessage: 'بارگذاری ویژگی‌ها ناموفق بود' },
  })

  const createMutation = useMutation({
    mutationFn: (dto: CreateProductAttributeDto) => productAttributesApi.create(dto),
    onSuccess: async () => {
      message.success('ویژگی ایجاد شد')
      page.value = 1
      await queryClient.invalidateQueries({
        queryKey: queryKeys.productAttributes.all,
      })
    },
    onError: (error) => notifyApiError(error, 'ایجاد ویژگی ناموفق بود'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProductAttributeDto }) =>
      productAttributesApi.update(id, dto),
    onSuccess: async () => {
      message.success('ویژگی به‌روزرسانی شد')
      await queryClient.invalidateQueries({
        queryKey: queryKeys.productAttributes.all,
      })
    },
    onError: (error) => notifyApiError(error, 'به‌روزرسانی ویژگی ناموفق بود'),
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => productAttributesApi.remove(id),
    onSuccess: async () => {
      message.success('ویژگی حذف شد')
      await queryClient.invalidateQueries({
        queryKey: queryKeys.productAttributes.all,
      })
    },
    onError: (error) => notifyApiError(error, 'حذف ویژگی ناموفق بود'),
  })

  const attributeList = computed(() => listQuery.data.value?.items ?? [])
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
    attributeList,
    total,
    page,
    pageSize,
    loading,
    saving,
    fetchPage,
    create: (dto: CreateProductAttributeDto) => tryMutate(createMutation.mutateAsync(dto)),
    update: (id: string, dto: UpdateProductAttributeDto) =>
      tryMutate(updateMutation.mutateAsync({ id, dto })),
    remove: (id: string) => tryMutateOk(removeMutation.mutateAsync(id)),
  })
}
