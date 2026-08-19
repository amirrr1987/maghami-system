import type {
  CreateProductUnitDto,
  PaginatedResult,
  PaginationQuery,
  UpdateProductUnitDto,
} from '@maghami-system/schemas'
import { apiRequest, jsonBody } from '@/api/client'
import { toListQuery } from '@/api/pagination'
import type { ProductUnit } from '@/api/types'

export const productUnitsApi = {
  list: (query: PaginationQuery) =>
    apiRequest<PaginatedResult<ProductUnit>>(`/product-units${toListQuery(query)}`),
  get: (id: string) => apiRequest<ProductUnit>(`/product-units/${id}`),
  create: (dto: CreateProductUnitDto) =>
    apiRequest<ProductUnit>('/product-units', {
      method: 'POST',
      body: jsonBody(dto),
    }),
  update: (id: string, dto: UpdateProductUnitDto) =>
    apiRequest<ProductUnit>(`/product-units/${id}`, {
      method: 'PATCH',
      body: jsonBody(dto),
    }),
  remove: (id: string) => apiRequest<void>(`/product-units/${id}`, { method: 'DELETE' }),
}
