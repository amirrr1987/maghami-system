import { useSessionStorage } from '@vueuse/core'
import type { RemovableRef, Serializer } from '@vueuse/core'

/** Access JWT + expiry in sessionStorage. Refresh JWT stays HttpOnly cookie only. */
export interface SessionTokens {
  accessToken: string | null
  expiresAt: number | null
}

const SESSION_KEY = 'maghami-system.auth.session'
const LEGACY_ACCESS_TOKEN_KEY = 'maghami-system.accessToken'
const LEGACY_EXPIRES_AT_KEY = 'maghami-system.accessTokenExpiresAt'

const emptySession = (): SessionTokens => ({
  accessToken: null,
  expiresAt: null,
})

function normalizeSession(value: unknown): SessionTokens {
  if (!value || typeof value !== 'object') return emptySession()
  const record = value as Record<string, unknown>
  return {
    accessToken: typeof record.accessToken === 'string' ? record.accessToken : null,
    expiresAt:
      typeof record.expiresAt === 'number' && Number.isFinite(record.expiresAt)
        ? record.expiresAt
        : null,
  }
}

const sessionSerializer: Serializer<SessionTokens> = {
  read: (raw) => normalizeSession(JSON.parse(raw)),
  write: (value) => JSON.stringify(value),
}

let sessionRef: RemovableRef<SessionTokens> | null = null

function migrateLegacyLocalStorage(): SessionTokens {
  try {
    const accessToken = localStorage.getItem(LEGACY_ACCESS_TOKEN_KEY)
    if (!accessToken) return emptySession()
    const rawExpiresAt = localStorage.getItem(LEGACY_EXPIRES_AT_KEY)
    const expiresAt = rawExpiresAt ? Number(rawExpiresAt) : null
    localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY)
    localStorage.removeItem(LEGACY_EXPIRES_AT_KEY)
    return normalizeSession({ accessToken, expiresAt })
  } catch {
    return emptySession()
  }
}

/** Call once from `main.ts` before the auth store is used. */
export function initSession(): RemovableRef<SessionTokens> {
  if (sessionRef) return sessionRef

  const initial = migrateLegacyLocalStorage()
  sessionRef = useSessionStorage<SessionTokens>(SESSION_KEY, initial, {
    mergeDefaults: true,
    serializer: sessionSerializer,
  })
  sessionRef.value = normalizeSession(sessionRef.value)

  return sessionRef
}

export function useSession(): RemovableRef<SessionTokens> {
  return initSession()
}

export function getAccessToken(): string | null {
  return useSession().value.accessToken
}

export function getAccessTokenExpiresAt(): number | null {
  return useSession().value.expiresAt
}

export function setAccessToken(token: string, expiresInSeconds?: number): void {
  const session = useSession()
  session.value = {
    accessToken: token,
    expiresAt:
      expiresInSeconds !== undefined
        ? Date.now() + expiresInSeconds * 1000
        : session.value.expiresAt,
  }
}

export function clearSessionTokens(): void {
  useSession().value = emptySession()
}

/** Clears tab session tokens. Refresh cookie is cleared by POST /auth/logout. */
export function clearTokens(): void {
  clearSessionTokens()
}
