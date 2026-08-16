---
name: ant-design-colors
description: >
  Type-safe @ant-design/colors palettes — generate, presets, Palette /
  PalettesProps. Use when deriving Ant Design color ramps or theming tokens
  with @ant-design/colors ^8 in apps/web.
---

# @ant-design/colors (type-safe)

Docs: [github.com/ant-design/ant-design-colors](https://github.com/ant-design/ant-design-colors).  
Version: `@ant-design/colors` **^8** in `apps/web`.

## Source of truth

Types and APIs from the package only:

```ts
import { generate, blue, red, presetPalettes } from '@ant-design/colors'
import type { Palette, PalettesProps } from '@ant-design/colors'
```

- `generate(hex: string): string[]` — 10-step ramp
- Presets (`blue`, `red`, …) are `Palette` (`string[]` with optional `.primary`)
- `PalettesProps` = `Record<string, Palette>`

## Typed usage

```ts
import { generate } from '@ant-design/colors'
import type { Palette } from '@ant-design/colors'

const ramp: Palette = generate('#1677ff')
const primary = ramp.primary ?? ramp[5]
```

Prefer pairing with antdv `ThemeConfig` / ConfigProvider (see `ant-design-vue` skill). App chrome still uses Tailwind utilities per project styling rules.

## This repo

Seed tokens live in `apps/web/src/theme/palettes.ts` (`Palette` / `PalettesProps` from the package) and are applied in `configProvider.store.ts`. Tailwind `@theme` in `apps/web/src/assets/main.css` aliases `--ant-color-*` (set by ConfigProvider from those seeds) as `primary` / `success` / `warning` / `error` / `info`.

## Anti-patterns

- Hand-rolled `string[]` color types instead of `Palette`
- Hardcoding Ant Design ramps that drift from `generate` / presets
- `any` for palette maps — use `PalettesProps`
