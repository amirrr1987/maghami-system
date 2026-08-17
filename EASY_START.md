# Easy start

Two ways to run the stack. Pick one.

| Mode | Best for | What runs in Docker |
|------|----------|---------------------|
| **A — Full stack** | Quick try / demo | Postgres + API + Web |
| **B — DB only** | Day-to-day coding | Postgres only (API/Web on your machine) |

**Need:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Compose v2). For mode B also **Node ≥ 20** and **pnpm 9**.

---

## A) Full stack (Docker only)

From the repo root:

```bash
docker compose up --build
```

Open:

| App | URL |
|-----|-----|
| Web | http://localhost:5173 |
| API | http://localhost:3000/v1 |
| Swagger | http://localhost:3000/docs |

Smoke check:

```bash
curl http://localhost:3000/v1
```

Stop:

```bash
docker compose down
```

Wipe database volume too:

```bash
docker compose down -v
```

---

## B) Local apps + Docker Postgres (recommended for development)

### 1. Start the database

```bash
docker compose up db -d
```

### 2. Install and configure

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
```

Keep these defaults in `apps/api/.env` (they match Compose):

```env
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=vue_nestjs_admin_template
TYPEORM_SYNC=true
CORS_ORIGIN=http://localhost:5173
```

### 3. Run API + Web

```bash
pnpm dev
```

| App | URL |
|-----|-----|
| Web | http://localhost:5173 |
| API | http://localhost:3000/v1 |
| Swagger | http://localhost:3000/docs |

API only / Web only:

```bash
pnpm dev:api
pnpm dev:web
```

---

## Useful Compose commands

```bash
# Status
docker compose ps

# API logs
docker compose logs -f api

# Rebuild after dependency changes
docker compose up --build

# Stop everything
docker compose down
```

---

## Ports

| Service | Host port | Inside container |
|---------|-----------|------------------|
| Web | `5173` (`WEB_PORT`) | `80` |
| API | `3000` (`PORT`) | `3000` |
| Postgres | `5432` (`DATABASE_PORT`) | `5432` |

Override with a root `.env` next to `docker-compose.yml`, for example:

```env
PORT=3000
WEB_PORT=5173
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=vue_nestjs_admin_template
TYPEORM_SYNC=true
CORS_ORIGIN=http://localhost:5173
```

---

## Troubleshooting

**Port already in use** — change `PORT`, `WEB_PORT`, or `DATABASE_PORT` in a root `.env`, or stop the other process.

**API cannot reach DB (mode A)** — wait for healthy Postgres (`docker compose ps`); `DATABASE_HOST` must be `db` inside Compose (already set).

**API cannot reach DB (mode B)** — ensure `docker compose up db -d` is running and `DATABASE_HOST=localhost` in `apps/api/.env`.

**Build fails on bcrypt** — the API image includes build tools; rebuild with `docker compose build --no-cache api`.
