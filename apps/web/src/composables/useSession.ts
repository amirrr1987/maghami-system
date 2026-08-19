import { useSessionStorage } from '@vueuse/core'
import type { RemovableRef } from '@vueuse/core'

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

let sessionRef: RemovableRef<SessionTokens> | null = null

function migrateLegacyLocalStorage(): Partial<SessionTokens> | null {
  try {
    const accessToken = localStorage.getItem(LEGACY_ACCESS_TOKEN_KEY)
    if (!accessToken) return null
    const rawExpiresAt = localStorage.getItem(LEGACY_EXPIRES_AT_KEY)
    const expiresAt = rawExpiresAt ? Number(rawExpiresAt) : null
    localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY)
    localStorage.removeItem(LEGACY_EXPIRES_AT_KEY)
    return {
      accessToken,
      expiresAt: expiresAt !== null && Number.isFinite(expiresAt) ? expiresAt : null,
    }
  } catch {
    return null
  }
}

/** Call once from `main.ts` before the auth store is used. */
export function initSession(): RemovableRef<SessionTokens> {
  if (sessionRef) return sessionRef

  const migrated = migrateLegacyLocalStorage()
  sessionRef = useSessionStorage<SessionTokens>(
    SESSION_KEY,
    migrated ?? emptySession(),
  )
  return sessionRef
}

export function useSession(): RemovableRef<SessionTokens> {
  if (!sessionRef) {
    initSession()
  }
  return sessionRef!
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
