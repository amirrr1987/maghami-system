import {
  AbilityBuilder,
  createMongoAbility,
  type CreateAbility,
  type MongoAbility,
} from '@casl/ability'
import { useAbility } from '@casl/vue'
import type { AbilityAction, AbilityRule, AbilitySubject } from '@maghami-system/schemas'

/**
 * Dynamic CASL: rules come from session `abilities` (permission.resource +
 * permission.action).
 */
export type AppAbility = MongoAbility<[AbilityAction, AbilitySubject]>

export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>

/** Shared reactive ability instance (updated after login /me). */
export const ability = createAppAbility()

export function buildAbilityRules(rules: readonly AbilityRule[]) {
  const { can, rules: caslRules } = new AbilityBuilder<AppAbility>(createAppAbility)
  for (const rule of rules) {
    can(rule.action, rule.subject)
  }
  return caslRules
}

export function updateAbilityFromRules(rules: readonly AbilityRule[]): void {
  ability.update(buildAbilityRules(rules))
}

export function useAppAbility() {
  return useAbility<AppAbility>()
}
