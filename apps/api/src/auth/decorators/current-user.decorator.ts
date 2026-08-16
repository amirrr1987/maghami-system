import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { User } from '../../users/user.entity';

export type AuthRequest = {
  user: User;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<AuthRequest>();
    return request.user;
  },
);
