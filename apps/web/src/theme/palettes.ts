import {
  blue,
  cyan,
  geekblue,
  gold,
  green,
  magenta,
  orange,
  purple,
  red,
  volcano,
} from '@ant-design/colors'
import type { Palette, PalettesProps } from '@ant-design/colors'
import type { AliasToken } from 'ant-design-vue/es/theme/interface'

/**
 * Preset ramps from `@ant-design/colors` — source of truth for seed tokens.
 */
export const semanticPalettes = {
  primary: blue,
  success: green,
  warning: gold,
  error: red,
  info: cyan,
} satisfies PalettesProps

export function palettePrimary(palette: Palette): string {
  const value = palette.primary ?? palette[5]
  if (value === undefined) {
    throw new Error('Palette is missing a primary color')
  }
  return value
}

export const seedColorTokens = {
  colorPrimary: palettePrimary(semanticPalettes.primary),
  colorSuccess: palettePrimary(semanticPalettes.success),
  colorWarning: palettePrimary(semanticPalettes.warning),
  colorError: palettePrimary(semanticPalettes.error),
  colorInfo: palettePrimary(semanticPalettes.info),
} satisfies Pick<
  AliasToken,
  'colorPrimary' | 'colorSuccess' | 'colorWarning' | 'colorError' | 'colorInfo'
>

export const primaryColorPresets: ReadonlyArray<{
  name: string
  palette: Palette
}> = [
  { name: 'blue', palette: blue },
  { name: 'geekblue', palette: geekblue },
  { name: 'cyan', palette: cyan },
  { name: 'green', palette: green },
  { name: 'gold', palette: gold },
  { name: 'orange', palette: orange },
  { name: 'volcano', palette: volcano },
  { name: 'red', palette: red },
  { name: 'magenta', palette: magenta },
  { name: 'purple', palette: purple },
]
