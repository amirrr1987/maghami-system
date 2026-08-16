---
name: nestjs
description: >
  Type-safe NestJS 10 core in apps/api — @nestjs/common, @nestjs/core,
  @nestjs/platform-express Module/Controller/Injectable. Use when adding
  modules, controllers, providers, or HTTP bootstrap.
---

# NestJS core (type-safe)

Docs: [docs.nestjs.com](https://docs.nestjs.com).  
Packages: `@nestjs/common` **^10**, `@nestjs/core` **^10**, `@nestjs/platform-express` **^10** in `apps/api`.

## Source of truth

```ts
import {
  Module,
  Controller,
  Get,
  Injectable,
  Inject,
  type OnModuleInit,
} from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
```

## Patterns (this repo)

```ts
@Module({
  imports: [UsersModule],
  controllers: [AppController],
  providers: [UsersService],
})
export class AppModule {}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll(query)
  }
}
```

Bootstrap: `apps/api/src/main.ts` via `NestFactory.create`. Related skills: `nestjs-config`, `nestjs-typeorm`, `nestjs-jwt`, `nestjs-swagger`, `zod`.

## Anti-patterns

- Untyped `@Body() body: any`
- Business DTOs not from `@maghami-system/schemas`
- Skipping DI for new services (manual `new Service()`)
