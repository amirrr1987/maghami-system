import type { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

export const REFRESH_COOKIE_NAME = 'vue_nestjs_admin_template_refresh';

/** Parse `7d` / `24h` / `30m` / `60s` into seconds. */
export function durationToSeconds(
  value: string | undefined,
  fallbackSeconds: number,
): number {
  if (!value) return fallbackSeconds;
  const match = /^(\d+)\s*([smhd])$/i.exec(value.trim());
  if (!match) return fallbackSeconds;
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const factor =
    unit === 's' ? 1 : unit === 'm' ? 60 : unit === 'h' ? 3600 : 86400;
  return amount * factor;
}

export function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    if (key !== name) continue;
    return decodeURIComponent(trimmed.slice(eq + 1));
  }
  return undefined;
}

export function refreshCookieOptions(config: ConfigService): {
  httpOnly: true;
  secure: boolean;
  sameSite: 'lax';
  path: string;
  maxAge: number;
} {
  const maxAgeSec = durationToSeconds(
    config.get<string>('JWT_REFRESH_EXPIRES_IN'),
    7 * 24 * 60 * 60,
  );
  const cookieSecure = config.get<string>('COOKIE_SECURE');
  const secure =
    cookieSecure === 'true' ||
    (cookieSecure !== 'false' &&
      config.get<string>('NODE_ENV') === 'production');
  return {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: config.get<string>('REFRESH_COOKIE_PATH') ?? '/',
    maxAge: maxAgeSec * 1000,
  };
}

export function setRefreshCookie(
  response: Response,
  token: string,
  config: ConfigService,
): void {
  response.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions(config));
}

export function clearRefreshCookie(
  response: Response,
  config: ConfigService,
): void {
  const options = refreshCookieOptions(config);
  response.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite,
    path: options.path,
  });
}
