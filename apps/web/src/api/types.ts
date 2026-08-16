import type {
  LabelValue,
  Permission,
  Product,
  Role,
  User,
} from '@maghami-system/schemas'

/** API resource shapes (passwordHash / nested permission trees never on User). */
export type { LabelValue, Permission, Product, Role }
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
