import { SetMetadata } from '@nestjs/common';
import type {
  AbilityRule,
  PermissionAction,
  PermissionResource,
} from '@vue-nestjs-admin-template/schemas';

export const REQUIRED_ABILITY_KEY = 'requiredAbility';

/** Require this CASL ability (page/API contract). */
export const RequireAbility = (
  action: PermissionAction,
  subject: PermissionResource,
) =>
  SetMetadata(REQUIRED_ABILITY_KEY, {
    action,
    subject,
  } satisfies AbilityRule);
