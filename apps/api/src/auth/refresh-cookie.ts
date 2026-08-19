import type { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { jwtRefreshExpiresInSeconds } from './jwt-duration';

export const REFRESH_COOKIE_NAME = 'maghami-system_refresh';

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
  const maxAgeSec = jwtRefreshExpiresInSeconds(config);
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
