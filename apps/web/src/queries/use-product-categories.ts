import { message } from 'ant-design-vue'
import type {
  CreateProductCategoryDto,
  PaginationQuery,
  UpdateProductCategoryDto,
} from '@maghami-system/schemas'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, reactive, ref, toValue, type MaybeRefOrGetter } from 'vue'
import { productCategoriesApi } from '@/api/product-categories.api'
import { notifyApiError } from '@/api/notify-api-error'
import { queryKeys } from '@/query/keys'
import { tryMutate, tryMutateOk } from '@/query/try-mutate'

export function useProductCategories(options?: {
  pageSize?: number
  enabled?: MaybeRefOrGetter<boolean>
}) {
  const queryClient = useQueryClient()
  const page = ref(1)
  const pageSize = ref(options?.pageSize ?? 10)

  const listQuery = useQuery({
    queryKey: computed(() =>
      queryKeys.productCategories.list({
        page: page.value,
        pageSize: pageSize.value,
      }),
    ),
    queryFn: () =>
      productCategoriesApi.list({
        page: page.value,
        pageSize: pageSize.value,
      }),
    enabled: () => toValue(options?.enabled) ?? true,
    meta: { errorMessage: 'بارگذاری دسته‌بندی‌ها ناموفق بود' },
  })

  const createMutation = useMutation({
    mutationFn: (dto: CreateProductCategoryDto) => productCategoriesApi.create(dto),
    onSuccess: async () => {
      message.success('دسته‌بندی ایجاد شد')
      page.value = 1
      await queryClient.invalidateQueries({
        queryKey: queryKeys.productCategories.all,
      })
    },
    onError: (error) => notifyApiError(error, 'ایجاد دسته‌بندی ناموفق بود'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProductCategoryDto }) =>
      productCategoriesApi.update(id, dto),
    onSuccess: async () => {
      message.success('دسته‌بندی به‌روزرسانی شد')
      await queryClient.invalidateQueries({
        queryKey: queryKeys.productCategories.all,
      })
    },
    onError: (error) => notifyApiError(error, 'به‌روزرسانی دسته‌بندی ناموفق بود'),
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => productCategoriesApi.remove(id),
    onSuccess: async () => {
      message.success('دسته‌بندی حذف شد')
      await queryClient.invalidateQueries({
        queryKey: queryKeys.productCategories.all,
      })
    },
    onError: (error) => notifyApiError(error, 'حذف دسته‌بندی ناموفق بود'),
  })

  const categoryList = computed(() => listQuery.data.value?.items ?? [])
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
    categoryList,
    total,
    page,
    pageSize,
    loading,
    saving,
    fetchPage,
    create: (dto: CreateProductCategoryDto) => tryMutate(createMutation.mutateAsync(dto)),
    update: (id: string, dto: UpdateProductCategoryDto) =>
      tryMutate(updateMutation.mutateAsync({ id, dto })),
    remove: (id: string) => tryMutateOk(removeMutation.mutateAsync(id)),
  })
}
