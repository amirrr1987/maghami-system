# maghami-system

Monorepo with **NestJS** (`apps/api`) and **Vue 3** (`apps/web`).

**Quick start (Docker or local):** see [EASY_START.md](./EASY_START.md).

## Setup

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
```

Ensure PostgreSQL is running and matches `apps/api/.env` (or `docker compose up db -d`).

## Dev

```bash
pnpm dev
```

- API: http://localhost:3000/v1
- Swagger UI: http://localhost:3000/docs
- Web: http://localhost:5173

## API — dynamic RBAC

Permissions, roles, and users are **data-driven** (CRUD), not hardcoded enums.
JSON responses use `ApiResult` (`status`, `message`, `isSuccess`, `data?`).

| Resource | Routes |
|----------|--------|
| Permissions | `GET/POST /v1/permissions`, `GET/PATCH/DELETE /v1/permissions/:id` |
| Roles | `GET/POST /v1/roles`, `GET/PATCH/DELETE /v1/roles/:id`, `PUT /v1/roles/:id/permissions` |
| Users | `GET/POST /v1/users`, `GET/PATCH/DELETE /v1/users/:id`, `PUT /v1/users/:id/roles` |

Validation: **Zod**. Persistence: **TypeORM** + **PostgreSQL (`pg`)**. Docs: **Swagger** at `/docs`.
