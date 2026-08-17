import { isApiResult, type ApiResult, type LoginResult } from '@maghami-system/schemas'
import { ApiError } from './types'
import { clearTokens, getAccessToken, setAccessToken } from './token'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

export type ApiRequestInit = RequestInit & {
  /** Do not attach Bearer token (login / refresh / logout). */
  skipAuth?: boolean
  /** Do not clear session / navigate on 401 (bootstrap /me). */
  skipUnauthorizedHandler?: boolean
  /** Internal: already retried after refresh. */
  _retriedAfterRefresh?: boolean
}

function nestMessage(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined
  const record = body as Record<string, unknown>
  if (typeof record.message === 'string') return record.message
  if (Array.isArray(record.message)) {
    return record.message.filter((m): m is string => typeof m === 'string').join(', ')
  }
  return undefined
}

function unwrapApiResult<T>(body: unknown, httpStatus: number): T {
  if (!isApiResult(body)) {
    throw new ApiError('Invalid API response envelope', httpStatus, body)
  }
  const result = body as ApiResult<T>
  if (!result.isSuccess) {
    throw new ApiError(
      nestMessage(result) ?? `Request failed (${result.status})`,
      result.status || httpStatus,
      result,
    )
  }
  return result.data as T
}

let unauthorizedHandler: (() => void) | null = null
let refreshInFlight: Promise<boolean> | null = null

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler
}

async function tryRefreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })
        const text = await response.text()
        let body: unknown = null
        if (text) {
          try {
            body = JSON.parse(text) as unknown
          } catch {
            body = text
          }
        }
        if (!response.ok) return false
        const tokens = unwrapApiResult<LoginResult>(body, response.status)
        setAccessToken(tokens.accessToken)
        return true
      } catch {
        return false
      } finally {
        refreshInFlight = null
      }
    })()
  }

  return refreshInFlight
}

export async function apiRequest<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
  const { skipAuth, skipUnauthorizedHandler, _retriedAfterRefresh, ...fetchInit } = init
  const headers = new Headers(fetchInit.headers)
  if (
    fetchInit.body !== undefined &&
    !headers.has('Content-Type') &&
    !(fetchInit.body instanceof FormData)
  ) {
    headers.set('Content-Type', 'application/json')
  }
  if (!skipAuth) {
    const token = getAccessToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...fetchInit,
    headers,
    credentials: 'include',
  })

  const text = await response.text()
  let body: unknown = null
  if (text) {
    try {
      body = JSON.parse(text) as unknown
    } catch {
      body = text
    }
  }

  if (!response.ok) {
    if (
      response.status === 401 &&
      !skipAuth &&
      !_retriedAfterRefresh &&
      path !== '/auth/refresh' &&
      path !== '/auth/logout'
    ) {
      const refreshed = await tryRefreshSession()
      if (refreshed) {
        return apiRequest<T>(path, {
          ...init,
          _retriedAfterRefresh: true,
        })
      }
      if (!skipUnauthorizedHandler) {
        clearTokens()
        unauthorizedHandler?.()
      }
    } else if (response.status === 401 && !skipAuth && !skipUnauthorizedHandler) {
      clearTokens()
      unauthorizedHandler?.()
    }
    throw new ApiError(
      nestMessage(body) ?? `Request failed (${response.status})`,
      response.status,
      body,
    )
  }

  return unwrapApiResult<T>(body, response.status)
}

export function jsonBody(data: unknown): string {
  return JSON.stringify(data)
}
