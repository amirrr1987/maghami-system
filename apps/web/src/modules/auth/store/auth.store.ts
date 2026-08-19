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
import { ApiError } from '@/api/types'
import { queryClient } from '@/query/client'
import { authApi } from '@/modules/auth/api/auth.api'
import { useSession } from '@/modules/auth/composables/useSession'

const REFRESH_BEFORE_EXPIRY_MS = 60_000

export const useAuthStore = defineStore('auth', () => {
  const session = useSession()
  const user = ref<AuthUser | null>(null)
  const abilities = ref<AbilityRule[]>([])
  const permissionCodes = ref<string[]>([])
  const bootstrapped = ref(false)
  const savingProfile = ref(false)

  let accessRefreshTimer: ReturnType<typeof setTimeout> | null = null

  const accessToken = computed(() => session.value.accessToken)
  const isAuthenticated = computed(() => Boolean(session.value.accessToken))

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
    authSession: AuthSession,
    token?: LoginResult['accessToken'],
    accessTokenExpiresIn?: LoginResult['accessTokenExpiresIn'],
  ): void {
    if (token !== undefined) {
      session.value = {
        accessToken: token,
        expiresAt:
          accessTokenExpiresIn !== undefined
            ? Date.now() + accessTokenExpiresIn * 1000
            : session.value.expiresAt,
      }
      if (accessTokenExpiresIn !== undefined) {
        scheduleAccessRefresh(accessTokenExpiresIn)
      }
    }
    user.value = authSession.user
    abilities.value = authSession.abilities
    permissionCodes.value = authSession.permissionCodes
    updateAbilityFromRules(authSession.abilities)
  }

  function clearSession(): void {
    clearAccessRefreshTimer()
    session.value = { accessToken: null, expiresAt: null }
    user.value = null
    abilities.value = []
    permissionCodes.value = []
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
      // Cookie clear is best-effort; always drop tab session tokens.
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
      const me = await authApi.me()
      applySession(me)
    } catch {
      clearSession()
    } finally {
      bootstrapped.value = true
    }
  }

  async function updateProfile(dto: UpdateProfileDto): Promise<boolean> {
    savingProfile.value = true
    try {
      const profile = await authApi.updateProfile(dto)
      applySession(profile)
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
