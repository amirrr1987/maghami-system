---
name: tailwindcss
description: >
  Type-safe Tailwind CSS v4 with @tailwindcss/vite in apps/web (Vue 3 + Vite) —
  @import tailwindcss, @theme, utility classes, coexistence with ant-design-vue.
  Use when styling with Tailwind, editing main.css, vite Tailwind plugin, or
  utility class patterns in Vue SFCs.
---

# Tailwind CSS v4 (apps/web)

Docs: [Vite install](https://tailwindcss.com/docs/installation/using-vite) · [theme](https://tailwindcss.com/docs/theme).

**Stack:** `tailwindcss` **4.x** + `@tailwindcss/vite` in `apps/web`. Confirm versions in `apps/web/package.json`.

## Wiring (this repo)

1. Vite plugin: `import tailwindcss from '@tailwindcss/vite'` then `tailwindcss()` in `vite.config.ts`
2. CSS entry: `apps/web/src/assets/main.css` with `@import 'tailwindcss';`
3. Import that CSS once from `main.ts` (after antdv `reset.css` is fine)

No `tailwind.config.js` / PostCSS required for the default v4 Vite setup.

## Source of truth

- Utility class names are **strings** in templates (`class` / `:class`) — do not invent typed class enums
- Design tokens live in CSS via **`@theme`** (package CSS API), not a parallel TS token map unless the project already has one
- Plugin types come from `@tailwindcss/vite` (`import tailwindcss from '@tailwindcss/vite'`) — no hand-rolled Vite plugin types

```ts
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss()],
});
```

```css
/* apps/web/src/assets/main.css */
@import 'tailwindcss';

@theme {
  --font-sans: 'IranSans', ui-sans-serif, system-ui, sans-serif;
}
```

```vue
<template>
  <div class="flex min-h-screen items-center justify-center p-6">
    <h1 class="text-2xl font-semibold tracking-tight">Maghami System</h1>
  </div>
</template>
```

## With ant-design-vue

Prefer **antdv components** for forms/tables/modals; use Tailwind for layout/spacing/page chrome.

**Styling policy (this repo):** no `<style>` / custom CSS classes / ad-hoc hex — see `.cursor/rules/web-styling-tailwind-antd.mdc`. Colors from `theme.useToken()` or `@ant-design/colors`.

If Preflight fights antdv `reset.css`, drop base and keep theme + utilities:

```css
@layer theme, base, components, utilities;
@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/utilities.css' layer(utilities);
```

Do not reintroduce Tailwind v3 `tailwind.config.js` + `content` globs unless migrating deliberately.

## Anti-patterns

- `any` / fake `TailwindClass` unions that drift from real utilities
- PostCSS `tailwindcss` v3 pipeline alongside `@tailwindcss/vite`
- Duplicating antdv component styles with large utility piles when an `a-*` component already fits
