import type {
  CreatePermissionDto,
  PaginatedResult,
  PaginationQuery,
  UpdatePermissionDto,
} from '@maghami-system/schemas'
import { apiRequest, jsonBody } from '@/api/client'
import { toListQuery } from '@/api/pagination'
import type { Permission } from '@/api/types'

export const permissionsApi = {
  list: (query: PaginationQuery) =>
    apiRequest<PaginatedResult<Permission>>(`/permissions${toListQuery(query)}`),
  get: (id: string) => apiRequest<Permission>(`/permissions/${id}`),
  create: (dto: CreatePermissionDto) =>
    apiRequest<Permission>('/permissions', {
      method: 'POST',
      body: jsonBody(dto),
    }),
  update: (id: string, dto: UpdatePermissionDto) =>
    apiRequest<Permission>(`/permissions/${id}`, {
      method: 'PATCH',
      body: jsonBody(dto),
    }),
  remove: (id: string) => apiRequest<void>(`/permissions/${id}`, { method: 'DELETE' }),
}
