---
name: typeorm-pg
description: >
  Type-safe TypeORM with PostgreSQL (pg) in NestJS — Entity, Repository,
  FindOptionsWhere, Relation types from typeorm, and postgres driver config.
  Use when writing entities, repositories, relations, queries, or DB modules.
---

# TypeORM + PostgreSQL (type-safe)

Stack: `typeorm` + `pg` (Nest registration: `nestjs-typeorm` skill). Confirm versions in `apps/api/package.json`.

## Source of truth

Use types from **`typeorm`** (and Nest wrappers), not hand-rolled DB models:

```ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  Repository,
  In,
  type FindOptionsWhere,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
```

- Entity classes are the schema; relations use lazy `() => OtherEntity`
- Prefer `Repository<Entity>`, `FindOptionsWhere<Entity>`, `In()` over deprecated `findByIds`
- Prefer `timestamptz` columns for dates on Postgres
- Driver: `type: 'postgres'` (uses `pg`)

## Nest wiring (this repo)

`ensurePostgresDatabase` runs in `TypeOrmModule.forRootAsync` before connect, so a missing `DATABASE_NAME` is created. Postgres itself must already be running.

`repairPermissionsCatalogBeforeSync` also runs before synchronize: backfills empty `resource`/`action` from `code`, drops legacy PG enums, and removes invalid rows (`full` / `write` / blank) so NOT NULL columns can sync.

Permission `resource` / `action` are **varchar** columns typed as shared enums in TypeScript — Zod validates the catalog; avoid Postgres `ENUM` with synchronize.

```ts
TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: async (config: ConfigService) => {
    const connection = { /* host/port/user/password/database from env */ };
    await ensurePostgresDatabase(connection);
    return {
      type: 'postgres' as const,
      ...connection,
      entities: [User, Role, Permission],
      synchronize: config.get<string>('TYPEORM_SYNC') === 'true',
    };
  },
});

TypeOrmModule.forFeature([User]);
```

Map Postgres unique violations (`23505`) to `ConflictException` when needed.

## Relations (dynamic RBAC)

- `User` ↔ `Role` via `user_roles`
- `Role` ↔ `Permission` via `role_permissions`
- Load with `relations: { roles: { permissions: true } }` (typed relation maps)

## Anti-patterns

- `any` on repository results
- Raw SQL string building without typed QueryBuilder parameters
- Leaving `synchronize: true` in production without an explicit decision
- Duplicating entity shapes as separate untyped interfaces
