import type {
  CreateProductCodePatternDto,
  PaginatedResult,
  PaginationQuery,
  UpdateProductCodePatternDto,
} from '@maghami-system/schemas'
import { apiRequest, jsonBody } from './client'
import { toListQuery } from './pagination'
import type { ProductCodePattern } from './types'

export const productCodePatternsApi = {
  list: (query: PaginationQuery) =>
    apiRequest<PaginatedResult<ProductCodePattern>>(
      `/product-code-patterns${toListQuery(query)}`,
    ),
  get: (id: string) =>
    apiRequest<ProductCodePattern>(`/product-code-patterns/${id}`),
  create: (dto: CreateProductCodePatternDto) =>
    apiRequest<ProductCodePattern>('/product-code-patterns', {
      method: 'POST',
      body: jsonBody(dto),
    }),
  update: (id: string, dto: UpdateProductCodePatternDto) =>
    apiRequest<ProductCodePattern>(`/product-code-patterns/${id}`, {
      method: 'PATCH',
      body: jsonBody(dto),
    }),
  remove: (id: string) =>
    apiRequest<void>(`/product-code-patterns/${id}`, { method: 'DELETE' }),
}
