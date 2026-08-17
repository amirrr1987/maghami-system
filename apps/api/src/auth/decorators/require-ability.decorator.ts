import { SetMetadata } from '@nestjs/common';
import type {
  AbilityAction,
  AbilityRule,
  AbilitySubject,
} from '@maghami-system/schemas';

export const REQUIRED_ABILITY_KEY = 'requiredAbility';

/**
 * Require this CASL ability (page/API contract).
 * Subject is typed as AbilitySubject; string literals are accepted for catalog
 * values when the enum member is temporarily unresolved by the language service.
 */
export const RequireAbility = (
  action: AbilityAction,
  subject: AbilitySubject | (string & {}),
) =>
  SetMetadata(REQUIRED_ABILITY_KEY, {
    action,
    subject,
  } as AbilityRule);
