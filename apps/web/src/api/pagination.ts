import type { PaginationQuery } from '@maghami-system/schemas'

/** Build `?page=&pageSize=` plus optional filter keys (skips empty/undefined). */
export function toListQuery(
  query: PaginationQuery &
    Record<string, string | number | boolean | undefined | null>,
): string {
  const params = new URLSearchParams()
  params.set('page', String(query.page))
  params.set('pageSize', String(query.pageSize))
  for (const [key, value] of Object.entries(query)) {
    if (key === 'page' || key === 'pageSize') continue
    if (value === undefined || value === null || value === '') continue
    params.set(key, String(value))
  }
  return `?${params.toString()}`
}
