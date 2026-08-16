---
name: nestjs-typeorm
description: >
  Type-safe @nestjs/typeorm — TypeOrmModule.forRootAsync/forFeature, InjectRepository.
  Use when registering entities or repositories in Nest modules (pair with typeorm-pg).
---

# @nestjs/typeorm (type-safe)

Docs: [docs.nestjs.com/techniques/database](https://docs.nestjs.com/techniques/database).  
Version: `@nestjs/typeorm` **^10** in `apps/api`. Entity/query types: `typeorm-pg` skill.

## Source of truth

```ts
import { TypeOrmModule, InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
```

## Patterns

```ts
TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: async (config: ConfigService) => {
    const connection = { /* host/port/username/password/database */ };
    await ensurePostgresDatabase(connection);
    return {
      type: 'postgres' as const,
      ...connection,
      entities: [User, Role, Permission, Product],
      synchronize: config.get<string>('TYPEORM_SYNC', 'true') === 'true',
    };
  },
})

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
})
export class UsersModule {}

constructor(
  @InjectRepository(User)
  private readonly users: Repository<User>,
) {}
```

## Anti-patterns

- `Repository<any>` / untyped entities
- Duplicating TypeORM connection config outside ConfigService without reason
