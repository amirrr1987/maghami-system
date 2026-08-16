import type {
  LabelValue,
  Permission,
  Product,
  ProductAttribute,
  ProductBrand,
  ProductCategory,
  ProductCategoryTreeNode,
  ProductCodePattern,
  ProductUnit,
  Role,
  User,
} from '@maghami-system/schemas'

/** API resource shapes (passwordHash / nested permission trees never on User). */
export type {
  LabelValue,
  Permission,
  Product,
  ProductAttribute,
  ProductBrand,
  ProductCategory,
  ProductCategoryTreeNode,
  ProductCodePattern,
  ProductUnit,
  Role,
}
export type PublicUser = User

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
