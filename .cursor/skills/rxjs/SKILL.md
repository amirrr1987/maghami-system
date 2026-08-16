---
name: rxjs
description: >
  Type-safe RxJS 7 with NestJS — Observable, firstValueFrom, operators. Use when
  writing Nest interceptors, async streams, or typing Observables in apps/api.
---

# RxJS (type-safe)

Docs: [rxjs.dev](https://rxjs.dev). Version: `rxjs` **^7.8** in `apps/api` (Nest peer).

## Source of truth

```ts
import { Observable, firstValueFrom, map, catchError, of } from 'rxjs'
import type { OperatorFunction } from 'rxjs'
```

Prefer generics on `Observable<T>` / operators — not `Observable<any>`.

```ts
function toResult<T>(source$: Observable<T>): Promise<T> {
  return firstValueFrom(source$)
}
```

Nest controllers may return `Observable` transparently; most this-repo services use `async`/`Promise`.

## Anti-patterns

- `any` in pipe operator chains
- Mixing unsubscribed long-lived subscriptions in Nest providers without cleanup
