---
name: vue-tsc
description: >
  Type-check Vue SFCs with vue-tsc — vue-tsc --build, project references. Use
  when fixing Vue/TS errors, type-check script, or SFC type issues in apps/web.
---

# vue-tsc (type-safe)

Docs: [github.com/vuejs/language-tools](https://github.com/vuejs/language-tools).  
Version: `vue-tsc` **^3.3** in `apps/web`. Also see `typescript` skill.

## Usage (this repo)

```bash
pnpm --filter @maghami-system/web type-check
# → vue-tsc --build
```

`build` runs `run-p type-check "build-only {@}"`.

## Guidance

- Fix errors using types from **source packages** (`vue`, `ant-design-vue`, `@maghami-system/schemas`) — not `any` suppressions
- Prefer narrowing (`asUser(record)`) over casting table `record` to `any`
- Keep `tsconfig` aligned with `@vue/tsconfig` / `@tsconfig/node24` (`vue-tsconfig` skill)

## Anti-patterns

- `// @ts-ignore` / `as any` to silence vue-tsc
- Skipping type-check in CI/local before merge
