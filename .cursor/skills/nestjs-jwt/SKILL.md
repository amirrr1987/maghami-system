---
name: nestjs-jwt
description: >
  Type-safe NestJS JWT auth with @nestjs/jwt, @nestjs/passport, passport,
  passport-jwt, and @types/passport-jwt — JwtModule, PassportStrategy, AuthGuard,
  Bearer tokens. Use when adding login, JWT guards, strategies, or protecting Nest routes.
---

# NestJS JWT + Passport (type-safe)

Docs: [docs.nestjs.com/security/authentication](https://docs.nestjs.com/security/authentication).  
Installed in `apps/api`: `@nestjs/jwt` ^10, `@nestjs/passport` ^10, `passport` ^0.7,
`passport-jwt` ^4, `@types/passport-jwt` ^4.

## Source of truth

Use types/exports from the packages — do not invent parallel JWT interfaces:

```ts
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule, PassportStrategy, AuthGuard } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { JwtFromRequestFunction } from 'passport-jwt';
```

Prefer a small typed payload interface in-app (e.g. `{ sub: User['id']; email: string }`) aligned with `Permission['id']` entity id style — not `any`.

## This repo pattern

- Login body: `loginSchema` from `@maghami-system/schemas`
- Module: `apps/api/src/auth/`
- Global `JwtAuthGuard` + `PermissionsGuard` (`APP_GUARD`)
- `@Public()` skips JWT; `@RequireAbility('read', 'users')` checks session abilities
- Swagger: `DocumentBuilder.addBearerAuth()` + `@ApiBearerAuth()`
- Env: `JWT_SECRET` (required), `JWT_EXPIRES_IN`, `JWT_REFRESH_SECRET` (optional fallback to `JWT_SECRET`), `JWT_REFRESH_EXPIRES_IN` (default `7d`), `COOKIE_SECURE`, `REFRESH_COOKIE_PATH`, `CORS_ORIGIN` (with `credentials: true`), `BOOTSTRAP_ADMIN_*`
- Cookie helpers: `apps/api/src/auth/refresh-cookie.ts` (`vue_nestjs_admin_template_refresh`, HttpOnly, SameSite=Lax)

```ts
@Public()
@Post('login')
async login(
  @Body(new ZodValidationPipe(loginSchema)) dto: LoginDto,
  @Res({ passthrough: true }) response: Response,
) {
  const pair = await this.authService.login(dto);
  setRefreshCookie(response, pair.refreshToken, this.config);
  return pair.login; // accessToken in body only
}

@Public()
@Post('refresh')
async refresh(
  @Req() request: Request,
  @Res({ passthrough: true }) response: Response,
) {
  const refreshToken = readCookie(request, REFRESH_COOKIE_NAME);
  // …rotate; set new cookie; return LoginResult without refreshToken
}

@Public()
@Post('logout')
logout(@Res({ passthrough: true }) response: Response): void {
  clearRefreshCookie(response, this.config);
}
```

Access JWT in Authorization Bearer; refresh JWT only in HttpOnly cookie (`typ: 'refresh'`). Access strategy rejects refresh tokens as Bearer. Web client: `credentials: 'include'`, access in `localStorage`, never store refresh in JS.

## Anti-patterns

- Putting permissions inside the JWT (stale RBAC) — load from roles on each request
- Direct user→permission grants (use roles)
- Hardcoding `secret: 'secret'` in source — use `ConfigService` / env
- Untyped `validate(payload: any)`

## Official docs

- Nest JWT: https://docs.nestjs.com/security/authentication
- passport-jwt: https://www.passportjs.org/packages/passport-jwt/
