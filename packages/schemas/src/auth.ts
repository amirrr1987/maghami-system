import { z } from 'zod';
import { emailSchema } from './common';
import type { AbilityRule } from './entities';
import {
  isPermissionAction,
  isPermissionResource,
  PermissionResource,
} from './permission';
import { createUserSchema } from './user';

/** Bootstrap / unlimited role unique `value` — bypasses permission checks. */
export const SUPER_ADMIN_ROLE_VALUE = 'super-admin';
export const SUPER_ADMIN_ROLE_NAME = SUPER_ADMIN_ROLE_VALUE;

export function isSuperAdminRoleValue(value: string): boolean {
  return value === SUPER_ADMIN_ROLE_VALUE;
}

/**
 * Sentinel included in `permissionCodes` for super-admin users.
 * Means unrestricted access (even for permissions not yet in the catalog).
 */
export const SUPER_ADMIN_PERMISSION_CODE = '*';

export const SUPER_ADMIN_ABILITY: AbilityRule = {
  action: 'manage',
  subject: 'all',
};

/**
 * Singular resource names (when deriving from `code`) → catalog subjects.
 */
const SUBJECT_ALIASES: Readonly<Record<string, PermissionResource>> = {
  user: PermissionResource.Users,
  role: PermissionResource.Roles,
  permission: PermissionResource.Permissions,
  product: PermissionResource.Products,
};

export function canonicalizeSubject(
  subject: string,
): PermissionResource | null {
  const key = subject.toLowerCase();
  const aliased = SUBJECT_ALIASES[key] ?? key;
  return isPermissionResource(aliased) ? aliased : null;
}

/** CASL rule used for authz. */
export function isSuperAdminAbility(rule: AbilityRule): boolean {
  return rule.action === 'manage' && rule.subject === 'all';
}

/**
 * Derive `{ action, subject }` from a `resource:action` key (or `*`).
 * Returns null if not a known catalog pair.
 */
export function parseAbilityFromCode(code: string): AbilityRule | null {
  const trimmed = code.trim();
  if (trimmed === SUPER_ADMIN_PERMISSION_CODE) {
    return SUPER_ADMIN_ABILITY;
  }
  const colon = trimmed.indexOf(':');
  if (colon <= 0 || colon >= trimmed.length - 1) {
    return null;
  }
  const subject = canonicalizeSubject(trimmed.slice(0, colon));
  const action = trimmed.slice(colon + 1).toLowerCase();
  if (!subject || !isPermissionAction(action)) {
    return null;
  }
  return { action, subject };
}

/** Exact ability match. `manage`/`all` covers every required rule. */
export function abilityCovers(
  granted: readonly AbilityRule[],
  required: AbilityRule,
): boolean {
  if (granted.some((rule) => isSuperAdminAbility(rule))) {
    return true;
  }
  return granted.some(
    (rule) =>
      rule.action === required.action && rule.subject === required.subject,
  );
}

export const loginSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(8).max(128),
  })
  .strict();

export type LoginDto = z.infer<typeof loginSchema>;

/** Self-service profile — no roles / isActive (those stay on admin user APIs). */
export const updateProfileSchema = z
  .object({
    email: createUserSchema.shape.email,
    name: createUserSchema.shape.name,
    password: createUserSchema.shape.password.optional(),
  })
  .strict();

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
