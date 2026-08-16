import { z } from 'zod';

/** Query aligned with antdv Table pagination (`current` → `page`). */
export const paginationQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional(),
    pageSize: z.coerce.number().int().min(1).max(100).optional(),
  })
  .transform((query) => ({
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 10,
  }));

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

/** List response for server-side Table pagination. */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export function toPaginatedResult<T>(
  items: T[],
  total: number,
  query: PaginationQuery,
): PaginatedResult<T> {
  return {
    items,
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
}

export function paginationSkipTake(query: PaginationQuery): {
  skip: number;
  take: number;
} {
  return {
    skip: (query.page - 1) * query.pageSize,
    take: query.pageSize,
  };
}
