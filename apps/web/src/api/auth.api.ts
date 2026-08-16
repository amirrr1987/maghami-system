import type {
  AuthSession,
  LoginDto,
  LoginResult,
  UpdateProfileDto,
} from '@maghami-system/schemas'
import { apiRequest, jsonBody } from './client'

function meRequestInit(): RequestInit & {
  skipUnauthorizedHandler: true
} {
  const init: RequestInit & { skipUnauthorizedHandler: true } = {
    skipUnauthorizedHandler: true,
  }
  if (typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal) {
    init.signal = AbortSignal.timeout(8_000)
  }
  return init
}

export const authApi = {
  login: (dto: LoginDto) =>
    apiRequest<LoginResult>('/auth/login', {
      method: 'POST',
      body: jsonBody(dto),
      skipAuth: true,
    }),
  refresh: () =>
    apiRequest<LoginResult>('/auth/refresh', {
      method: 'POST',
      skipAuth: true,
      skipUnauthorizedHandler: true,
    }),
  logout: () =>
    apiRequest<undefined>('/auth/logout', {
      method: 'POST',
      skipAuth: true,
      skipUnauthorizedHandler: true,
    }),
  me: () => apiRequest<AuthSession>('/auth/me', meRequestInit()),
  updateProfile: (dto: UpdateProfileDto) =>
    apiRequest<AuthSession>('/auth/me', {
      method: 'PATCH',
      body: jsonBody(dto),
    }),
}
