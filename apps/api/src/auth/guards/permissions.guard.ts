import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { abilityCovers, type AbilityRule } from '@maghami-system/schemas';
import { UsersService } from '../../users/users.service';
import type { AuthRequest } from '../decorators/current-user.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { REQUIRED_ABILITY_KEY } from '../decorators/require-ability.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly usersService: UsersService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const required = this.reflector.getAllAndOverride<AbilityRule>(
      REQUIRED_ABILITY_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthRequest>();
    const granted = this.usersService.abilitiesOf(request.user);
    if (!abilityCovers(granted, required)) {
      throw new ForbiddenException(
        `Missing ability: ${required.action} ${required.subject}`,
      );
    }
    return true;
  }
}
