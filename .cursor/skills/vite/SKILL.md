---
name: vite
description: >
  Type-safe Vite 8 + @vitejs/plugin-vue + vite-plugin-vue-devtools in apps/web —
  defineConfig, plugins, aliases. Use when editing vite.config, dev server,
  proxy, or Vue Vite plugins.
---

# Vite + Vue plugins (type-safe)

Docs: [vite.dev](https://vite.dev). Versions in `apps/web`: `vite` **^8**, `@vitejs/plugin-vue` **^6**, `vite-plugin-vue-devtools` **^8**. Tailwind: `tailwindcss` skill (`@tailwindcss/vite`).

## Source of truth

```ts
import { defineConfig, type UserConfig, type PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
```

Prefer `defineConfig` return typing from Vite — do not invent loose config interfaces.

## This repo (`apps/web/vite.config.ts`)

```ts
export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Vite aliases workspace schemas to source (CJS dist is for Nest)
      '@vue-nestjs-admin-template/schemas': schemasEntry,
    },
  },
  server: {
    port: 5173,
    proxy: { '/api': { target: 'http://localhost:3000', changeOrigin: true, rewrite: … } },
  },
})
```

Scripts: `pnpm --filter @vue-nestjs-admin-template/web dev` → `vite`.

## Anti-patterns

- Untyped `as any` on `defineConfig`
- Breaking the `@vue-nestjs-admin-template/schemas` source alias without a Nest/Vite dual-resolve plan
- Adding npm/yarn — use **pnpm** only
