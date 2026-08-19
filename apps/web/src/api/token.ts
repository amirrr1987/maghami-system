const ACCESS_TOKEN_KEY = 'maghami-system.accessToken'
const ACCESS_TOKEN_EXPIRES_AT_KEY = 'maghami-system.accessTokenExpiresAt'

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  } catch {
    return null
  }
}

export function getAccessTokenExpiresAt(): number | null {
  try {
    const raw = localStorage.getItem(ACCESS_TOKEN_EXPIRES_AT_KEY)
    if (!raw) return null
    const ms = Number(raw)
    return Number.isFinite(ms) ? ms : null
  } catch {
    return null
  }
}

export function setAccessToken(token: string, expiresInSeconds?: number): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
  if (expiresInSeconds !== undefined) {
    localStorage.setItem(
      ACCESS_TOKEN_EXPIRES_AT_KEY,
      String(Date.now() + expiresInSeconds * 1000),
    )
  }
}

export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(ACCESS_TOKEN_EXPIRES_AT_KEY)
}

/** Clears access token. Refresh lives in HttpOnly cookie only. */
export function clearTokens(): void {
  clearAccessToken()
}
