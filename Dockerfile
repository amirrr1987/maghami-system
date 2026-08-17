# syntax=docker/dockerfile:1
# Multi-stage build for the pnpm monorepo (api + web).
# Build context must be the repository root.

ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-bookworm-slim AS base
ARG PNPM_VERSION=9.15.0
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/schemas/package.json packages/schemas/
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY tsconfig.base.json ./
COPY packages/schemas packages/schemas
COPY apps/api apps/api
COPY apps/web apps/web
RUN pnpm --filter @maghami-system/schemas build \
  && pnpm --filter @maghami-system/api build \
  && pnpm --filter @maghami-system/web build

# ----- API (NestJS) -----
# Copy the built workspace so pnpm's linked node_modules keep working.
FROM base AS api
ENV NODE_ENV=production
ENV NODE_OPTIONS=--dns-result-order=ipv4first
COPY --from=build /app /app
WORKDIR /app/apps/api
EXPOSE 3000
CMD ["node", "dist/main.js"]

# ----- Web (static Vue build via nginx) -----
FROM nginx:1.27-alpine AS web
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
