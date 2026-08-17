import type {
  CreateProductDto,
  PaginatedResult,
  ProductListQuery,
  UpdateProductDto,
} from '@maghami-system/schemas'
import { apiRequest, jsonBody } from './client'
import { toListQuery } from './pagination'
import type { Product } from './types'

export const productsApi = {
  list: (query: ProductListQuery) =>
    apiRequest<PaginatedResult<Product>>(`/products${toListQuery(query)}`),
  get: (id: string) => apiRequest<Product>(`/products/${id}`),
  previewSku: (categoryId: string) =>
    apiRequest<{ sku: string }>(
      `/products/sku-preview?categoryId=${encodeURIComponent(categoryId)}`,
    ),
  create: (dto: CreateProductDto) =>
    apiRequest<Product>('/products', {
      method: 'POST',
      body: jsonBody(dto),
    }),
  update: (id: string, dto: UpdateProductDto) =>
    apiRequest<Product>(`/products/${id}`, {
      method: 'PATCH',
      body: jsonBody(dto),
    }),
  remove: (id: string) => apiRequest<void>(`/products/${id}`, { method: 'DELETE' }),
}
