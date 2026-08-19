import type { ConfigService } from '@nestjs/config';

export const DEFAULT_JWT_EXPIRES_IN = '1d';
export const DEFAULT_JWT_REFRESH_EXPIRES_IN = '7d';

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

export function jwtAccessExpiresIn(config: ConfigService): string {
  return config.get<string>('JWT_EXPIRES_IN', DEFAULT_JWT_EXPIRES_IN);
}

export function jwtRefreshExpiresIn(config: ConfigService): string {
  return config.get<string>(
    'JWT_REFRESH_EXPIRES_IN',
    DEFAULT_JWT_REFRESH_EXPIRES_IN,
  );
}

export function jwtAccessExpiresInSeconds(config: ConfigService): number {
  return durationToSeconds(jwtAccessExpiresIn(config), 86400);
}

export function jwtRefreshExpiresInSeconds(config: ConfigService): number {
  return durationToSeconds(
    jwtRefreshExpiresIn(config),
    7 * 24 * 60 * 60,
  );
}
