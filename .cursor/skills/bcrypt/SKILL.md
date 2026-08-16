---
name: bcrypt
description: >
  Type-safe bcrypt password hashing in apps/api — hash, compare, @types/bcrypt.
  Use when hashing user passwords or verifying login credentials.
---

# bcrypt (type-safe)

Docs: [github.com/kelektiv/node.bcrypt.js](https://github.com/kelektiv/node.bcrypt.js).  
Versions: `bcrypt` **^5**, `@types/bcrypt` **^5** in `apps/api`.

## Source of truth

```ts
import * as bcrypt from 'bcrypt'
// or
import { hash, compare } from 'bcrypt'
```

Types from `@types/bcrypt` — `hash(data, saltOrRounds): Promise<string>`, `compare(data, encrypted): Promise<boolean>`.

## Pattern

```ts
const passwordHash = await bcrypt.hash(plainPassword, 10)
const ok = await bcrypt.compare(plainPassword, user.passwordHash)
```

Never log plaintext passwords or return hashes to the client (PublicUser omits hash).

## Anti-patterns

- Sync `hashSync` in request path without need
- Storing plaintext or reversible encryption instead of bcrypt
- Untyped `bcrypt as any`
