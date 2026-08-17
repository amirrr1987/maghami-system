# Easy start

Three ways to run the stack. Pick one.

| Mode | Best for | What runs in Docker |
|------|----------|---------------------|
| **A — Full stack** | Quick try / demo | Postgres + API + Web + pgAdmin |
| **B — DB only** | Day-to-day coding | Postgres (+ optional pgAdmin) |
| **C — VPS / IP** | Test on a server with no domain | Postgres + API + Web + pgAdmin on port 80 |

**Need:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Compose v2) for A/B. Mode C: Docker Engine + Compose v2 on Linux. For mode B also **Node ≥ 20** and **pnpm 9**.

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
| API (via nginx) | http://localhost:5173/api |
| API (direct) | http://localhost:3000/v1 |
| Swagger | http://localhost:5173/docs |
| pgAdmin | http://localhost:5173/pgadmin4 |

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

Optional pgAdmin (login with `PGADMIN_DEFAULT_EMAIL` / `PGADMIN_DEFAULT_PASSWORD`, defaults `admin@localhost.ir` / `admin`):

```bash
docker compose up db pgadmin -d
```

Then open http://localhost:5050/pgadmin4 . The preloaded server **maghami-system** uses host `maghami-system-db`. Postgres password is `DATABASE_PASSWORD` (default `postgres`).

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

## C) VPS by IP only (no domain)

Linux VPS: **Ubuntu 24.04 LTS** (not 20.04; 22.04 is a fine fallback). Do **not** use Windows Server. Build needs about **6–8 GB RAM**.

On the server, from the repo root:

```bash
cp .env.example .env
```

Edit `.env`:

- `PUBLIC_ORIGIN=http://YOUR.SERVER.IP` — exactly what you type in the browser (no trailing slash; add `:port` if `WEB_PORT` is not 80)
- Set `DATABASE_PASSWORD`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `BOOTSTRAP_ADMIN_PASSWORD`, `PGADMIN_DEFAULT_EMAIL`, `PGADMIN_DEFAULT_PASSWORD`

Then:

```bash
docker compose -f docker-compose.server.yml up --build -d
```

Open:

| App | URL |
|-----|-----|
| Web | http://YOUR.SERVER.IP/ |
| API (via nginx) | http://YOUR.SERVER.IP/api |
| Swagger | http://YOUR.SERVER.IP/docs |
| pgAdmin | http://YOUR.SERVER.IP/pgadmin4 |

Postgres and Nest are **not** published on the host. Only port **80**.

pgAdmin login is `PGADMIN_DEFAULT_EMAIL` / `PGADMIN_DEFAULT_PASSWORD`. Connect with the preloaded **maghami-system** server (host `db`, password = `DATABASE_PASSWORD`).

Logs / stop:

```bash
docker compose -f docker-compose.server.yml logs -f
docker compose -f docker-compose.server.yml down
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

| Service | Host port (A / B) | Host port (C) | Inside container |
|---------|-------------------|---------------|------------------|
| Web | `5173` (`WEB_PORT`) | `80` (`WEB_PORT`) | `80` |
| API | `3000` (`PORT`) | not published | `3000` |
| Postgres | `5432` (`DATABASE_PORT`) | not published | `5432` |
| pgAdmin | `5050` (`PGADMIN_PORT`) | not published (`/pgadmin4` on 80) | `80` |

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

**API cannot reach DB (mode A)** — wait for healthy Postgres (`docker compose ps`); `DATABASE_HOST` must be `db` inside Compose (already set). If logs show `getaddrinfo EAI_AGAIN db`, recreate: `docker compose up --build`.

**502 on `/api/...`** — nginx cannot reach Nest. Wait until Compose shows the API healthy (log: `Nest application successfully started`). Then recreate:

```bash
docker compose down
docker compose up --build
```

If a root `.env` changed `DATABASE_PASSWORD` after the first Postgres volume was created, either put the original password back or wipe the volume (`docker compose down -v`) and start again.

**API cannot reach DB (mode B)** — ensure `docker compose up db -d` is running and `DATABASE_HOST=localhost` in `apps/api/.env`.

**Build fails on bcrypt** — the API image includes build tools; rebuild with `docker compose build --no-cache api`.

**Login fails on VPS (CORS)** — `PUBLIC_ORIGIN` must match the browser address bar exactly (`http://IP`, no trailing slash).

**Login succeeds but session drops (HTTP)** — keep `COOKIE_SECURE=false` in `.env` for IP testing without HTTPS.

**Compose build killed / out of memory** — use a 6–8 GB plan, or add swap, then retry `docker compose -f docker-compose.server.yml up --build -d`.

**pgAdmin cannot reach Postgres** — use host `db` (Docker DNS), not `localhost`. Password is `DATABASE_PASSWORD` from `.env`.
