import type {
  BulkDeleteFilesDto,
  CreateFileFolderDto,
  FileFolderDto,
  FileStats,
  FilesListQuery,
  MoveFileDto,
  PaginatedResult,
  ReorderFilesDto,
  StoredFile,
  StorageInfo,
  UpdateFileFolderDto,
  UpdateFileMetaDto,
} from '@maghami-system/schemas'
import { apiRequest, jsonBody } from './client'
import { getAccessToken, clearTokens } from './token'
import { ApiError } from './types'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

function toFilesListQuery(query: FilesListQuery): string {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
    folderId: query.folderId ?? 'root',
  })
  if (query.q) {
    params.set('q', query.q)
  }
  return `?${params.toString()}`
}

export const filesApi = {
  storage: () => apiRequest<StorageInfo>('/files/storage'),

  stats: () => apiRequest<FileStats>('/files/stats'),

  listFolders: () => apiRequest<FileFolderDto[]>('/files/folders'),

  createFolder: (dto: CreateFileFolderDto) =>
    apiRequest<FileFolderDto>('/files/folders', {
      method: 'POST',
      body: jsonBody(dto),
    }),

  updateFolder: (id: string, dto: UpdateFileFolderDto) =>
    apiRequest<FileFolderDto>(`/files/folders/${id}`, {
      method: 'PATCH',
      body: jsonBody(dto),
    }),

  removeFolder: (id: string) =>
    apiRequest<void>(`/files/folders/${id}`, { method: 'DELETE' }),

  list: (query: FilesListQuery) =>
    apiRequest<PaginatedResult<StoredFile>>(
      `/files${toFilesListQuery(query)}`,
    ),

  upload(
    file: File,
    folderId: string | null = null,
    meta: { title: string; alt?: string },
  ): Promise<StoredFile> {
    const body = new FormData()
    body.append('file', file)
    body.append('title', meta.title)
    body.append('alt', meta.alt ?? '')
    if (folderId) {
      body.append('folderId', folderId)
    }
    return apiRequest<StoredFile>('/files', {
      method: 'POST',
      body,
    })
  },

  move: (id: string, dto: MoveFileDto) =>
    apiRequest<StoredFile>(`/files/${id}/location`, {
      method: 'PATCH',
      body: jsonBody(dto),
    }),

  updateMeta: (id: string, dto: UpdateFileMetaDto) =>
    apiRequest<StoredFile>(`/files/${id}/meta`, {
      method: 'PATCH',
      body: jsonBody(dto),
    }),

  reorder: (dto: ReorderFilesDto) =>
    apiRequest<void>('/files/reorder', {
      method: 'PUT',
      body: jsonBody(dto),
    }),

  remove(id: string): Promise<void> {
    return apiRequest<void>(`/files/${id}`, { method: 'DELETE' })
  },

  bulkRemove: (dto: BulkDeleteFilesDto) =>
    apiRequest<{ deleted: number }>('/files/bulk-delete', {
      method: 'POST',
      body: jsonBody(dto),
    }),

  async fetchBlob(id: string): Promise<Blob> {
    const headers = new Headers({ Accept: '*/*' })
    const token = getAccessToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    const response = await fetch(`${API_BASE}/files/${id}/content`, {
      headers,
      credentials: 'include',
    })
    if (!response.ok) {
      if (response.status === 401) {
        clearTokens()
      }
      throw new ApiError(
        `Failed to load file (${response.status})`,
        response.status,
        null,
      )
    }
    return response.blob()
  },
}
