import { blue, cyan, gold, green, red } from '@ant-design/colors'
import { describe, expect, it } from 'vitest'
import { palettePrimary, primaryColorPresets, seedColorTokens } from '../palettes'

describe('seedColorTokens', () => {
  it('uses @ant-design/colors preset primaries', () => {
    expect(seedColorTokens.colorPrimary).toBe(palettePrimary(blue))
    expect(seedColorTokens.colorSuccess).toBe(palettePrimary(green))
    expect(seedColorTokens.colorWarning).toBe(palettePrimary(gold))
    expect(seedColorTokens.colorError).toBe(palettePrimary(red))
    expect(seedColorTokens.colorInfo).toBe(palettePrimary(cyan))
  })

  it('exposes named primary presets from @ant-design/colors', () => {
    const bluePreset = primaryColorPresets.find((preset) => preset.name === 'blue')
    expect(bluePreset).toBeDefined()
    if (!bluePreset) {
      return
    }
    expect(palettePrimary(bluePreset.palette)).toBe(palettePrimary(blue))
  })
})
