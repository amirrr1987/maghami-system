---
name: oxlint
description: >
  Fast oxlint linting in apps/web — .oxlintrc.json, eslint-plugin-oxlint bridge.
  Use when editing oxlint config, lint:oxlint script, or aligning ESLint with oxlint.
---

# oxlint (type-safe / config-safe)

Docs: [oxc.rs/docs/guide/usage/linter](https://oxc.rs/docs/guide/usage/linter).  
Versions: `oxlint` **~1.74**, `eslint-plugin-oxlint` **~1.73** in `apps/web`.

## This repo

- Config: `apps/web/.oxlintrc.json`
- Script: `pnpm --filter @vue-nestjs-admin-template/web lint:oxlint` → `oxlint . --fix`
- ESLint bridge: `pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json')` (`eslint` skill)

Prefer fixing findings properly; do not disable broadly without reason.

## Anti-patterns

- Ignoring oxlint while only running ESLint (both run via `lint`)
- Hand-maintaining divergent duplicate rule sets in ESLint and oxlint without the plugin bridge
