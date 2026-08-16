import faIR from 'ant-design-vue/es/locale/fa_IR'
import { theme as antdTheme } from 'ant-design-vue/es'
import type {
  MappingAlgorithm,
  SizeType,
  ThemeConfig,
} from 'ant-design-vue/es/config-provider/context'
import type { Locale } from 'ant-design-vue/es/locale'
import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, watch } from 'vue'
import { seedColorTokens } from '@/theme/palettes'

const STORAGE_KEY = 'vue-nestjs-admin-template.configProvider'

/** App is Persian / RTL only. */
export const APP_LOCALE: Locale = faIR
export const APP_DIRECTION = 'rtl' as const

export type AppAppearance = 'light' | 'dark'
export type AppComponentSize = Exclude<SizeType, undefined>
export type AppCompact = 'compact' | 'default'
export type AppFontSize = 12 | 14 | 16 | 18 | 20
export type AppBorderRadius = 0 | 6 | 12

export const FONT_SIZE_OPTIONS = [12, 14, 16, 18, 20] as const satisfies readonly AppFontSize[]
export const BORDER_RADIUS_OPTIONS = [0, 6, 12] as const satisfies readonly AppBorderRadius[]

type PersistedConfig = {
  componentSize: AppComponentSize
  appearance: AppAppearance
  compact: AppCompact
  fontSize: AppFontSize
  borderRadius: AppBorderRadius
  colorPrimary: string
}

const defaults: PersistedConfig = {
  componentSize: 'middle',
  appearance: 'light',
  compact: 'default',
  fontSize: 16,
  borderRadius: 6,
  colorPrimary: seedColorTokens.colorPrimary,
}

function isFontSize(value: unknown): value is AppFontSize {
  return (FONT_SIZE_OPTIONS as readonly number[]).includes(value as number)
}

function isBorderRadius(value: unknown): value is AppBorderRadius {
  return value === 0 || value === 6 || value === 12
}

function normalizePrefs(raw: PersistedConfig): PersistedConfig {
  return {
    componentSize:
      raw.componentSize === 'small' ||
        raw.componentSize === 'middle' ||
        raw.componentSize === 'large'
        ? raw.componentSize
        : defaults.componentSize,
    appearance: raw.appearance === 'dark' ? 'dark' : 'light',
    compact: raw.compact === 'compact' ? 'compact' : 'default',
    fontSize: isFontSize(raw.fontSize) ? raw.fontSize : defaults.fontSize,
    borderRadius: isBorderRadius(raw.borderRadius)
      ? raw.borderRadius
      : defaults.borderRadius,
    colorPrimary:
      typeof raw.colorPrimary === 'string' && raw.colorPrimary.length > 0
        ? raw.colorPrimary
        : defaults.colorPrimary,
  }
}

function applyDocument(appearance: AppAppearance): void {
  document.documentElement.lang = 'fa'
  document.documentElement.dir = APP_DIRECTION
  document.documentElement.classList.toggle('dark', appearance === 'dark')
}

/**
 * Ant Design Vue ConfigProvider state — fixed fa-IR / RTL, size, theme.
 * Persisted via `useLocalStorage`.
 */
export const useConfigProviderStore = defineStore('configProvider', () => {
  const prefs = useLocalStorage<PersistedConfig>(STORAGE_KEY, { ...defaults })
  prefs.value = normalizePrefs(prefs.value)

  const componentSize = computed(() => prefs.value.componentSize)
  const appearance = computed(() => prefs.value.appearance)
  const compact = computed(() => prefs.value.compact)
  const fontSize = computed(() => prefs.value.fontSize)
  const borderRadius = computed(() => prefs.value.borderRadius)
  const colorPrimary = computed(() => prefs.value.colorPrimary)
  const locale = computed<Locale>(() => APP_LOCALE)
  const direction = computed(() => APP_DIRECTION)

  const { token: antdToken } = antdTheme.useToken()

  const theme = computed<ThemeConfig>(() => {
    const algorithm: MappingAlgorithm[] = []
    if (appearance.value === 'dark') {
      algorithm.push(antdTheme.darkAlgorithm)
    }
    if (compact.value === 'compact') {
      algorithm.push(antdTheme.compactAlgorithm)
    }

    return {
      token: {
        fontFamily: 'Vazirmatn, sans-serif',
        ...seedColorTokens,
        colorPrimary: colorPrimary.value,
        fontSize: fontSize.value,
        borderRadius: borderRadius.value,
      },
      algorithm: algorithm.length > 0 ? algorithm : undefined,
      components: {
        Layout: {
          colorBgHeader: antdToken.value.colorBgContainer,
          colorBgBody: antdToken.value.colorBgLayout,
          colorBgTrigger: colorPrimary.value,
        },
      },
    }
  })

  function setCompact(next: AppCompact): void {
    prefs.value.compact = next
  }

  function setFontSize(next: AppFontSize): void {
    prefs.value.fontSize = next
  }

  function setBorderRadius(next: AppBorderRadius): void {
    prefs.value.borderRadius = next
  }

  function setComponentSize(next: AppComponentSize): void {
    prefs.value.componentSize = next
  }

  function setAppearance(next: AppAppearance): void {
    prefs.value.appearance = next
  }

  function setColorPrimary(next: string): void {
    prefs.value.colorPrimary = next
  }

  function resetSettings(): void {
    prefs.value = { ...defaults }
  }

  applyDocument(prefs.value.appearance)
  watch(
    () => prefs.value.appearance,
    (next) => applyDocument(next),
  )

  return {
    theme,
    componentSize,
    locale,
    direction,
    appearance,
    colorPrimary,
    compact,
    fontSize,
    borderRadius,
    setCompact,
    setFontSize,
    setBorderRadius,
    setComponentSize,
    setAppearance,
    setColorPrimary,
    resetSettings,
  }
})
