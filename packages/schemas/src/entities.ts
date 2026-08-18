/**
 * Shared resource shapes (JSON over the wire).
 * Prefer indexed access: `Permission['id']`, `Role['value']`, `User['id']`.
 */

import type { PermissionAction, PermissionResource } from './permission';
import type { ProductAttributeType } from './product-coding-common';

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
  avatarFileId: string | null;
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
  avatarFileId: string | null;
}

/** Uploaded file metadata (content served via authenticated GET). */
export interface StoredFile {
  id: string;
  originalName: string;
  title: string;
  alt: string;
  mimeType: string;
  sizeBytes: number;
  folderId: string | null;
  sortOrder: number;
  createdAt: string;
}

/** Flat folder for organizing files (DB only — disk names stay flat). */
export interface FileFolder {
  id: string;
  name: string;
  /** null = top-level under library root */
  parentId: string | null;
  createdAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  code: string;
  description: string | null;
  parentId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Nested category tree node for admin tree views. */
export interface ProductCategoryTreeNode extends ProductCategory {
  children: ProductCategoryTreeNode[];
}

export interface ProductBrand {
  id: string;
  name: string;
  code: string;
  logoFileId: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductUnit {
  id: string;
  name: string;
  code: string;
  symbol: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductAttribute {
  id: string;
  name: string;
  code: string;
  type: ProductAttributeType;
  options: string[] | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductAttributeValue {
  id: string;
  productId: string;
  attributeId: string;
  value: string;
  attribute?: Pick<
    ProductAttribute,
    'id' | 'name' | 'code' | 'type' | 'options'
  >;
}

export interface ProductCodePattern {
  id: string;
  categoryId: string;
  prefix: string;
  separator: string;
  length: number;
  nextSequence: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  categoryId: string | null;
  brandId: string | null;
  unitId: string | null;
  barcode: string | null;
  description: string | null;
  /** Legacy field — kept for existing products UI compatibility. */
  price: number;
  isActive: boolean;
  attributeValues: ProductAttributeValue[];
  createdAt: string;
  updatedAt: string;
}

/** Aliases of entity ids — keep in sync with the interfaces above. */
export type PermissionId = Permission['id'];
export type RoleId = Role['value'];
export type UserId = User['id'];
export type ProductId = Product['id'];
export type ProductCategoryId = ProductCategory['id'];
export type ProductBrandId = ProductBrand['id'];
export type ProductUnitId = ProductUnit['id'];
export type ProductAttributeId = ProductAttribute['id'];
export type ProductCodePatternId = ProductCodePattern['id'];

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
