import type {
  CreateProductBrandDto,
  PaginatedResult,
  PaginationQuery,
  UpdateProductBrandDto,
} from '@maghami-system/schemas'
import { apiRequest, jsonBody } from '@/api/client'
import { toListQuery } from '@/api/pagination'
import type { ProductBrand } from '@/api/types'

export const productBrandsApi = {
  list: (query: PaginationQuery) =>
    apiRequest<PaginatedResult<ProductBrand>>(`/product-brands${toListQuery(query)}`),
  get: (id: string) => apiRequest<ProductBrand>(`/product-brands/${id}`),
  create: (dto: CreateProductBrandDto) =>
    apiRequest<ProductBrand>('/product-brands', {
      method: 'POST',
      body: jsonBody(dto),
    }),
  update: (id: string, dto: UpdateProductBrandDto) =>
    apiRequest<ProductBrand>(`/product-brands/${id}`, {
      method: 'PATCH',
      body: jsonBody(dto),
    }),
  remove: (id: string) => apiRequest<void>(`/product-brands/${id}`, { method: 'DELETE' }),
}
