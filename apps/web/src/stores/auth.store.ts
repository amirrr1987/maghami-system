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

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(getAccessToken())
  const user = ref<AuthUser | null>(null)
  const abilities = ref<AbilityRule[]>([])
  const permissionCodes = ref<string[]>([])
  const bootstrapped = ref(false)
  const savingProfile = ref(false)

  const isAuthenticated = computed(() => Boolean(accessToken.value))

  function applySession(session: AuthSession, token?: LoginResult['accessToken']): void {
    if (token !== undefined) {
      accessToken.value = token
      setAccessToken(token)
    }
    user.value = session.user
    abilities.value = session.abilities
    permissionCodes.value = session.permissionCodes
    updateAbilityFromRules(session.abilities)
  }

  function clearSession(): void {
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
    applySession(result, result.accessToken)
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
      try {
        const result = await authApi.refresh()
        applySession(result, result.accessToken)
      } catch {
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
