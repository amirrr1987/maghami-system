---
name: nestjs-config
description: >
  Type-safe @nestjs/config — ConfigModule, ConfigService.get with generics. Use
  when reading env vars, forRoot/forRootAsync, or wiring Nest config in apps/api.
---

# @nestjs/config (type-safe)

Docs: [docs.nestjs.com/techniques/configuration](https://docs.nestjs.com/techniques/configuration).  
Version: `@nestjs/config` **^3** in `apps/api`.

## Source of truth

```ts
import { ConfigModule, ConfigService } from '@nestjs/config'
```

## This repo (`app.module.ts`)

```ts
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: ['.env', 'apps/api/.env'],
}),

TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    host: config.get<string>('DATABASE_HOST', 'localhost'),
    port: Number(config.get<string>('DATABASE_PORT', '5432')),
    // …
  }),
})
```

Prefer `config.get<string>(…)` (or a validated env schema) — not untyped `process.env` sprinkled in services when ConfigService is available.

## Anti-patterns

- `config.get(...)` without type param then treating as `any`
- Committing secrets in `.env` examples with real credentials
