import type {
  CreateRoleDto,
  PaginatedResult,
  PaginationQuery,
  SetRolePermissionsDto,
  UpdateRoleDto,
} from '@maghami-system/schemas'
import { apiRequest, jsonBody } from './client'
import { toListQuery } from './pagination'
import type { Role } from './types'

export const rolesApi = {
  list: (query: PaginationQuery) =>
    apiRequest<PaginatedResult<Role>>(`/roles${toListQuery(query)}`),
  get: (id: Role['value']) => apiRequest<Role>(`/roles/${id}`),
  create: (dto: CreateRoleDto) =>
    apiRequest<Role>('/roles', { method: 'POST', body: jsonBody(dto) }),
  update: (id: Role['value'], dto: UpdateRoleDto) =>
    apiRequest<Role>(`/roles/${id}`, { method: 'PATCH', body: jsonBody(dto) }),
  setPermissions: (id: Role['value'], dto: SetRolePermissionsDto) =>
    apiRequest<Role>(`/roles/${id}/permissions`, {
      method: 'PUT',
      body: jsonBody(dto),
    }),
  remove: (id: Role['value']) => apiRequest<void>(`/roles/${id}`, { method: 'DELETE' }),
}
