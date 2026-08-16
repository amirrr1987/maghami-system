import type { User } from '../users/user.entity';

export type JwtTokenType = 'access' | 'refresh';

/** JWT payload — keep small; load permissions server-side. */
export interface JwtPayload {
  sub: User['id'];
  email: string;
  typ: JwtTokenType;
}
