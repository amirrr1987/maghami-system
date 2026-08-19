import type {
  AbilityRule,
  AuthSession,
  AuthUser,
  LoginDto,
  LoginResult,
  UpdateProfileDto,
} from '@maghami-system/schemas'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { message } from 'ant-design-vue'
import { updateAbilityFromRules } from '@/ability'
import { authApi } from '@/api/auth.api'
import { ApiError } from '@/api/types'
import { clearTokens, getAccessToken, setAccessToken } from '@/api/token'
import { queryClient } from '@/query/client'

const REFRESH_BEFORE_EXPIRY_MS = 60_000

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(getAccessToken())
  const user = ref<AuthUser | null>(null)
  const abilities = ref<AbilityRule[]>([])
  const permissionCodes = ref<string[]>([])
  const bootstrapped = ref(false)
  const savingProfile = ref(false)

  let accessRefreshTimer: ReturnType<typeof setTimeout> | null = null

  const isAuthenticated = computed(() => Boolean(accessToken.value))

  function clearAccessRefreshTimer(): void {
    if (accessRefreshTimer !== null) {
      clearTimeout(accessRefreshTimer)
      accessRefreshTimer = null
    }
  }

  async function refreshAccessToken(): Promise<boolean> {
    try {
      const result = await authApi.refresh()
      applySession(result, result.accessToken, result.accessTokenExpiresIn)
      return true
    } catch {
      return false
    }
  }

  function scheduleAccessRefresh(expiresInSeconds: number): void {
    clearAccessRefreshTimer()
    const delayMs = Math.max(0, expiresInSeconds * 1000 - REFRESH_BEFORE_EXPIRY_MS)
    accessRefreshTimer = setTimeout(() => {
      void refreshAccessToken()
    }, delayMs)
  }

  function applySession(
    session: AuthSession,
    token?: LoginResult['accessToken'],
    accessTokenExpiresIn?: LoginResult['accessTokenExpiresIn'],
  ): void {
    if (token !== undefined) {
      accessToken.value = token
      setAccessToken(token, accessTokenExpiresIn)
      if (accessTokenExpiresIn !== undefined) {
        scheduleAccessRefresh(accessTokenExpiresIn)
      }
    }
    user.value = session.user
    abilities.value = session.abilities
    permissionCodes.value = session.permissionCodes
    updateAbilityFromRules(session.abilities)
  }

  function clearSession(): void {
    clearAccessRefreshTimer()
    accessToken.value = null
    user.value = null
    abilities.value = []
    permissionCodes.value = []
    clearTokens()
    updateAbilityFromRules([])
    queryClient.clear()
  }

  function isSelf(userId: string): boolean {
    return user.value?.id === userId
  }

  async function login(dto: LoginDto): Promise<LoginResult> {
    const result = await authApi.login(dto)
    applySession(result, result.accessToken, result.accessTokenExpiresIn)
    bootstrapped.value = true
    return result
  }

  async function logout(): Promise<void> {
    try {
      await authApi.logout()
    } catch {
      // Cookie clear is best-effort; always drop local access token.
    }
    clearSession()
  }

  async function fetchMe(): Promise<void> {
    if (!accessToken.value) {
      const ok = await refreshAccessToken()
      if (!ok) {
        clearSession()
        bootstrapped.value = true
        return
      }
    }
    if (!accessToken.value) {
      clearSession()
      bootstrapped.value = true
      return
    }
    try {
      const session = await authApi.me()
      applySession(session)
    } catch {
      clearSession()
    } finally {
      bootstrapped.value = true
    }
  }

  async function updateProfile(dto: UpdateProfileDto): Promise<boolean> {
    savingProfile.value = true
    try {
      const session = await authApi.updateProfile(dto)
      applySession(session)
      message.success('پروفایل ذخیره شد')
      return true
    } catch (error) {
      if (error instanceof ApiError) {
        message.error(error.message)
      } else {
        message.error('ذخیره پروفایل ناموفق بود')
      }
      return false
    } finally {
      savingProfile.value = false
    }
  }

  return {
    accessToken,
    user,
    abilities,
    permissionCodes,
    bootstrapped,
    savingProfile,
    isAuthenticated,
    isSelf,
    login,
    logout,
    fetchMe,
    updateProfile,
    clearSession,
  }
})
