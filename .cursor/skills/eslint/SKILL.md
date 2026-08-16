---
name: eslint
description: >
  Flat ESLint 10 stack for apps/web — eslint-plugin-vue, @vue/eslint-config-typescript,
  prettier skip, vitest/playwright/oxlint plugins. Use when editing eslint.config.ts
  or lint rules.
---

# ESLint flat config (apps/web)

Versions: `eslint` **^10**, `eslint-plugin-vue` **~10.9**, `@vue/eslint-config-typescript` **^14**,  
`eslint-config-prettier`, `eslint-plugin-playwright`, `@vitest/eslint-plugin`,  
`eslint-plugin-oxlint`, `vue-eslint-parser` (pulled via Vue TS config).

## Source of truth

Config helpers from packages — do not invent untyped plugin shapes:

```ts
import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginPlaywright from 'eslint-plugin-playwright'
import pluginVitest from '@vitest/eslint-plugin'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from 'eslint-config-prettier/flat'
```

## This repo (`apps/web/eslint.config.ts`)

```ts
export default defineConfigWithVueTs(
  { files: ['**/*.{vue,ts,mts,tsx}'] },
  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),
  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  { ...pluginPlaywright.configs['flat/recommended'], files: ['e2e/**/*.{test,spec}.{js,ts,jsx,tsx}'] },
  { ...pluginVitest.configs.recommended, files: ['src/**/__tests__/*'] },
  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),
  skipFormatting,
)
```

Script: `pnpm --filter @vue-nestjs-admin-template/web lint:eslint` → `eslint . --fix --cache`.

Formatting is **oxfmt** / Prettier skip — do not re-enable formatting rules in ESLint.

## Anti-patterns

- Legacy `.eslintrc` alongside flat config
- Duplicating oxlint rules as ESLint without `eslint-plugin-oxlint` bridge
- npm/yarn for lint deps — **pnpm** only
