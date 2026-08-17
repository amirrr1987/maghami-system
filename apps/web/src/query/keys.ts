import type { FilesListQuery, PaginationQuery, ProductListQuery } from '@maghami-system/schemas'

export const queryKeys = {
  users: {
    all: ['users'] as const,
    list: (query: PaginationQuery) => ['users', 'list', query] as const,
  },
  roles: {
    all: ['roles'] as const,
    list: (query: PaginationQuery) => ['roles', 'list', query] as const,
    options: ['roles', 'options'] as const,
  },
  permissions: {
    all: ['permissions'] as const,
    list: (query: PaginationQuery) => ['permissions', 'list', query] as const,
    options: ['permissions', 'options'] as const,
  },
  products: {
    all: ['products'] as const,
    list: (query: ProductListQuery) => ['products', 'list', query] as const,
  },
  productCategories: {
    all: ['product-categories'] as const,
    list: (query: PaginationQuery) => ['product-categories', 'list', query] as const,
  },
  productBrands: {
    all: ['product-brands'] as const,
    list: (query: PaginationQuery) => ['product-brands', 'list', query] as const,
  },
  productUnits: {
    all: ['product-units'] as const,
    list: (query: PaginationQuery) => ['product-units', 'list', query] as const,
  },
  productAttributes: {
    all: ['product-attributes'] as const,
    list: (query: PaginationQuery) => ['product-attributes', 'list', query] as const,
  },
  productCodePatterns: {
    all: ['product-code-patterns'] as const,
    list: (query: PaginationQuery) => ['product-code-patterns', 'list', query] as const,
  },
  files: {
    all: ['files'] as const,
    list: (query: FilesListQuery) => ['files', 'list', query] as const,
    folders: ['files', 'folders'] as const,
    stats: ['files', 'stats'] as const,
  },
}
