import type { PaginationQuery } from '@maghami-system/schemas'

export function toListQuery(query: PaginationQuery): string {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
  })
  return `?${params.toString()}`
}
