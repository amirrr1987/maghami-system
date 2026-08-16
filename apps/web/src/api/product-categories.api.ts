import type {
  CreateProductCategoryDto,
  PaginatedResult,
  PaginationQuery,
  UpdateProductCategoryDto,
} from '@maghami-system/schemas'
import { apiRequest, jsonBody } from './client'
import { toListQuery } from './pagination'
import type { ProductCategory, ProductCategoryTreeNode } from './types'

export const productCategoriesApi = {
  list: (query: PaginationQuery) =>
    apiRequest<PaginatedResult<ProductCategory>>(
      `/product-categories${toListQuery(query)}`,
    ),
  tree: () =>
    apiRequest<ProductCategoryTreeNode[]>('/product-categories/tree'),
  get: (id: string) =>
    apiRequest<ProductCategory>(`/product-categories/${id}`),
  create: (dto: CreateProductCategoryDto) =>
    apiRequest<ProductCategory>('/product-categories', {
      method: 'POST',
      body: jsonBody(dto),
    }),
  update: (id: string, dto: UpdateProductCategoryDto) =>
    apiRequest<ProductCategory>(`/product-categories/${id}`, {
      method: 'PATCH',
      body: jsonBody(dto),
    }),
  remove: (id: string) =>
    apiRequest<void>(`/product-categories/${id}`, { method: 'DELETE' }),
}
