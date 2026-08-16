import type {
  CreateProductAttributeDto,
  PaginatedResult,
  PaginationQuery,
  UpdateProductAttributeDto,
} from '@maghami-system/schemas'
import { apiRequest, jsonBody } from './client'
import { toListQuery } from './pagination'
import type { ProductAttribute } from './types'

export const productAttributesApi = {
  list: (query: PaginationQuery) =>
    apiRequest<PaginatedResult<ProductAttribute>>(
      `/product-attributes${toListQuery(query)}`,
    ),
  get: (id: string) =>
    apiRequest<ProductAttribute>(`/product-attributes/${id}`),
  create: (dto: CreateProductAttributeDto) =>
    apiRequest<ProductAttribute>('/product-attributes', {
      method: 'POST',
      body: jsonBody(dto),
    }),
  update: (id: string, dto: UpdateProductAttributeDto) =>
    apiRequest<ProductAttribute>(`/product-attributes/${id}`, {
      method: 'PATCH',
      body: jsonBody(dto),
    }),
  remove: (id: string) =>
    apiRequest<void>(`/product-attributes/${id}`, { method: 'DELETE' }),
}
