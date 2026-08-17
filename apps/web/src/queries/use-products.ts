import { message } from 'ant-design-vue'
import type {
  CreateProductDto,
  ProductListQuery,
  UpdateProductDto,
} from '@maghami-system/schemas'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, reactive, ref } from 'vue'
import { productsApi } from '@/api/products.api'
import { notifyApiError } from '@/api/notify-api-error'
import { queryKeys } from '@/query/keys'
import { tryMutate, tryMutateOk } from '@/query/try-mutate'

export function useProducts() {
  const queryClient = useQueryClient()
  const page = ref(1)
  const pageSize = ref(10)
  const q = ref('')
  const categoryId = ref<string | undefined>(undefined)
  const brandId = ref<string | undefined>(undefined)
  const isActive = ref<boolean | undefined>(undefined)

  const listQueryParams = computed(
    (): ProductListQuery => ({
      page: page.value,
      pageSize: pageSize.value,
      q: q.value || undefined,
      categoryId: categoryId.value,
      brandId: brandId.value,
      isActive: isActive.value,
    }),
  )

  const listQuery = useQuery({
    queryKey: computed(() => queryKeys.products.list(listQueryParams.value)),
    queryFn: () => productsApi.list(listQueryParams.value),
    meta: { errorMessage: 'بارگذاری محصولات ناموفق بود' },
  })

  const createMutation = useMutation({
    mutationFn: (dto: CreateProductDto) => productsApi.create(dto),
    onSuccess: async () => {
      message.success('محصول ایجاد شد')
      page.value = 1
      await queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
    },
    onError: (error) => notifyApiError(error, 'ایجاد محصول ناموفق بود'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProductDto }) =>
      productsApi.update(id, dto),
    onSuccess: async () => {
      message.success('محصول به‌روزرسانی شد')
      await queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
    },
    onError: (error) => notifyApiError(error, 'به‌روزرسانی محصول ناموفق بود'),
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: async () => {
      message.success('محصول حذف شد')
      await queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
    },
    onError: (error) => notifyApiError(error, 'حذف محصول ناموفق بود'),
  })

  const productList = computed(() => listQuery.data.value?.items ?? [])
  const total = computed(() => listQuery.data.value?.total ?? 0)
  const loading = computed(() => listQuery.isFetching.value)
  const saving = computed(
    () =>
      createMutation.isPending.value ||
      updateMutation.isPending.value ||
      removeMutation.isPending.value,
  )

  function fetchPage(query: Partial<ProductListQuery> = {}): Promise<void> {
    if (query.page !== undefined) page.value = query.page
    if (query.pageSize !== undefined) pageSize.value = query.pageSize
    if (query.q !== undefined) q.value = query.q ?? ''
    if (query.categoryId !== undefined) categoryId.value = query.categoryId
    if (query.brandId !== undefined) brandId.value = query.brandId
    if (query.isActive !== undefined) isActive.value = query.isActive
    return Promise.resolve()
  }

  return reactive({
    productList,
    total,
    page,
    pageSize,
    q,
    loading,
    saving,
    fetchPage,
    create: (dto: CreateProductDto) =>
      tryMutate(createMutation.mutateAsync(dto)),
    update: (id: string, dto: UpdateProductDto) =>
      tryMutate(updateMutation.mutateAsync({ id, dto })),
    remove: (id: string) => tryMutateOk(removeMutation.mutateAsync(id)),
  })
}
