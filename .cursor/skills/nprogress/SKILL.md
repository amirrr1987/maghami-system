---
name: nprogress
description: >
  Type-safe nprogress 0.2 + @types/nprogress 0.2.3 in apps/web — NProgress,
  NProgressOptions, or VueUse useNProgress. Use for top loading bars on route
  or query fetches.
---

# nprogress + @types/nprogress (type-safe)

Docs: [ricostacruz.com/nprogress](https://ricostacruz.com/nprogress/).  
Installed: `nprogress@^0.2.0`, `@types/nprogress@^0.2.3` (`apps/web`). Types are **`export =`** (CJS).

## Source of truth

`@types/nprogress` namespace `nProgress` — do not invent a parallel options type.

```ts
import NProgress from 'nprogress'
import type { NProgressOptions } from 'nprogress'
import 'nprogress/nprogress.css'
```

Package interfaces (verbatim shape):

```ts
interface NProgressOptions {
  minimum: number
  template: string
  easing: string
  speed: number
  trickle: boolean
  trickleSpeed: number
  showSpinner: boolean
  parent: string
  positionUsing: string
  barSelector: string
  spinnerSelector: string
}

interface NProgress {
  version: string
  settings: NProgressOptions
  status: number | null
  configure(options: Partial<NProgressOptions>): NProgress
  set(n: number): NProgress
  isStarted(): boolean
  start(): NProgress
  done(force?: boolean): NProgress
  inc(amount?: number): NProgress
  trickle(): NProgress
  render(fromStart?: boolean): HTMLDivElement
  remove(): void
  isRendered(): boolean
  getPositioningCSS(): 'translate3d' | 'translate' | 'margin'
}
```

```ts
const opts: Partial<NProgressOptions> = { showSpinner: false, trickleSpeed: 200 }
NProgress.configure(opts)
NProgress.start()
NProgress.done()
```

## Vue 3 (prefer VueUse)

This repo also has `@vueuse/integrations`. Types from that package:

```ts
import { useNProgress } from '@vueuse/integrations/useNProgress'
import type {
  UseNProgressOptions,
  UseNProgressReturn,
} from '@vueuse/integrations/useNProgress'

// UseNProgressOptions = Partial<NProgressOptions>
const bar: UseNProgressReturn = useNProgress(undefined, { showSpinner: false })
bar.isLoading.value = true
bar.done()
```

`UseNProgressReturn`: `isLoading` (`WritableComputedRef<boolean>`), `progress` (`Ref<number | null | undefined>`), `start`, `done`, `remove`.

## Anti-patterns

- Hand-rolled `interface ProgressBarOptions`
- `any` on `configure(...)`
- Forgetting `nprogress/nprogress.css`
- Importing types from a local duplicate instead of `nprogress` / `@vueuse/integrations/useNProgress`
