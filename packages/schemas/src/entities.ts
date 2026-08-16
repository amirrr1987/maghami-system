/**
 * Shared resource shapes (JSON over the wire).
 * Prefer indexed access: `Permission['id']`, `Role['value']`, `User['id']`.
 */

import type { PermissionAction, PermissionResource } from './permission';

/** antdv Select-compatible option (`:options` / assignment refs). */
export interface LabelValue {
  label: string;
  value: string;
}

/** Super-admin CASL sentinel (not a catalog permission row). */
export type AbilityAction = PermissionAction | 'manage';
export type AbilitySubject = PermissionResource | 'all';

/**
 * CASL tuple used for authz.
 * UI and API match on `action` + `subject` (permission.resource).
 */
export interface AbilityRule {
  action: AbilityAction;
  subject: AbilitySubject;
}

export interface Permission {
  id: string;
  /** CASL subject from PermissionResource. */
  resource: PermissionResource;
  /** CASL action from PermissionAction. */
  action: PermissionAction;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Permission on Role payloads / Select — `{ label, value }` only. */
export type PermissionRef = LabelValue;

/**
 * Role resource and Select option.
 * `label` is display (any language); `value` is the unique slug (e.g. super-admin).
 */
export interface Role extends LabelValue {
  description: string | null;
  /** Assigned permissions as label/value (not full permission trees). */
  permissions: PermissionRef[];
  createdAt: string;
  updatedAt: string;
}

/** Role on User payloads — `{ label, value }` only. */
export type RoleRef = Pick<Role, 'label' | 'value'>;

export interface User {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  /** Assigned roles as label/value (never nested permissions). */
  roles: RoleRef[];
  createdAt: string;
  updatedAt: string;
}

/** Session identity — no roles/permissions trees (use abilities). */
export interface AuthUser {
  id: User['id'];
  email: string;
  name: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Aliases of entity ids — keep in sync with the interfaces above. */
export type PermissionId = Permission['id'];
export type RoleId = Role['value'];
export type UserId = User['id'];
export type ProductId = Product['id'];

export interface AuthSession {
  user: AuthUser;
  /** Effective CASL rules from role permissions (`resource` + `action`). */
  abilities: AbilityRule[];
  /** Derived keys `resource:action` (display / debug). Not used for UI gating. */
  permissionCodes: string[];
}

export interface LoginResult extends AuthSession {
  accessToken: string;
  tokenType: 'Bearer';
}
