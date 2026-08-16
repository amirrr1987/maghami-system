import type {
  CreateUserDto,
  PaginatedResult,
  PaginationQuery,
  SetUserRolesDto,
  UpdateUserDto,
} from '@maghami-system/schemas'
import { apiRequest, jsonBody } from './client'
import { toListQuery } from './pagination'
import type { PublicUser } from './types'

export const usersApi = {
  list: (query: PaginationQuery) =>
    apiRequest<PaginatedResult<PublicUser>>(`/users${toListQuery(query)}`),
  get: (id: string) => apiRequest<PublicUser>(`/users/${id}`),
  create: (dto: CreateUserDto) =>
    apiRequest<PublicUser>('/users', { method: 'POST', body: jsonBody(dto) }),
  update: (id: string, dto: UpdateUserDto) =>
    apiRequest<PublicUser>(`/users/${id}`, {
      method: 'PATCH',
      body: jsonBody(dto),
    }),
  setRoles: (id: string, dto: SetUserRolesDto) =>
    apiRequest<PublicUser>(`/users/${id}/roles`, {
      method: 'PUT',
      body: jsonBody(dto),
    }),
  remove: (id: string) =>
    apiRequest<void>(`/users/${id}`, { method: 'DELETE' }),
}
