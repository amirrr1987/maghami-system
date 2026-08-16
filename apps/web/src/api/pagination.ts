import type { PaginationQuery } from '@vue-nestjs-admin-template/schemas'

export function toListQuery(query: PaginationQuery): string {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
  })
  return `?${params.toString()}`
}
