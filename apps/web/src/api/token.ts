const ACCESS_TOKEN_KEY = 'vue-nestjs-admin-template.accessToken'

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  } catch {
    return null
  }
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

/** Clears access token. Refresh lives in HttpOnly cookie only. */
export function clearTokens(): void {
  clearAccessToken()
}
