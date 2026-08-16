import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
  PermissionAction,
  PermissionResource,
  type Permission,
  type Product,
  type Role,
  type User,
} from '@vue-nestjs-admin-template/schemas';
import {
  permissionIdRef,
  productIdRef,
  roleIdRef,
  userIdRef,
} from './openapi.ids';

/** OpenAPI models for Swagger UI — validation stays in Zod schemas. */

export class PermissionResponse {
  @ApiProperty({
    allOf: [permissionIdRef],
    description: 'Unique identifier of a permission.',
  })
  id!: Permission['id'];

  @ApiProperty({
    enum: PERMISSION_RESOURCES,
    example: PermissionResource.Users,
    description: 'CASL subject from PermissionResource.',
  })
  resource!: PermissionResource;

  @ApiProperty({
    enum: PERMISSION_ACTIONS,
    example: PermissionAction.Read,
    description: 'CASL action from PermissionAction.',
  })
  action!: PermissionAction;

  @ApiProperty({ example: 'Read users' })
  name!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  description!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;
}

export class LabelValueResponse {
  @ApiProperty({
    example: 'مدیر کل',
    description: 'Display label for Select / tags (any language)',
  })
  label!: string;

  @ApiProperty({
    description: 'Stable unique Select value (role slug or permission id)',
  })
  value!: string;
}

export class RoleResponse {
  @ApiProperty({
    example: 'مدیر کل',
    description: 'Display label for Select / tags (any language)',
  })
  label!: Role['label'];

  @ApiProperty({
    allOf: [roleIdRef],
    description: 'Unique slug used as Select value',
  })
  value!: Role['value'];

  @ApiPropertyOptional({ nullable: true, type: String })
  description!: string | null;

  @ApiProperty({
    type: () => [LabelValueResponse],
    description: 'Assigned permissions as label/value options',
  })
  permissions!: LabelValueResponse[];

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;
}

export class RoleRefResponse extends LabelValueResponse {}

export class UserResponse {
  @ApiProperty({
    allOf: [userIdRef],
    description: 'Unique identifier of a user.',
  })
  id!: User['id'];

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: 'Ada Lovelace' })
  name!: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({
    type: () => [LabelValueResponse],
    description: 'Assigned roles as label/value (no nested permissions).',
  })
  roles!: LabelValueResponse[];

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;
}

export class CreatePermissionBody {
  @ApiProperty({
    enum: PERMISSION_RESOURCES,
    example: PermissionResource.Products,
  })
  resource!: PermissionResource;

  @ApiProperty({
    enum: PERMISSION_ACTIONS,
    example: PermissionAction.Update,
  })
  action!: PermissionAction;

  @ApiProperty({ example: 'Read users', maxLength: 255 })
  name!: string;

  @ApiPropertyOptional({ nullable: true, maxLength: 2000 })
  description?: string | null;
}

export class UpdatePermissionBody {
  @ApiPropertyOptional({
    enum: PERMISSION_RESOURCES,
    example: PermissionResource.Products,
  })
  resource?: PermissionResource;

  @ApiPropertyOptional({
    enum: PERMISSION_ACTIONS,
    example: PermissionAction.Update,
  })
  action?: PermissionAction;

  @ApiPropertyOptional({ example: 'Read users', maxLength: 255 })
  name?: string;

  @ApiPropertyOptional({ nullable: true, maxLength: 2000 })
  description?: string | null;
}

export class ProductResponse {
  @ApiProperty({
    allOf: [productIdRef],
    description: 'Unique identifier of a product.',
  })
  id!: Product['id'];

  @ApiProperty({ example: 'SKU-1001' })
  sku!: string;

  @ApiProperty({ example: 'Sensor Kit' })
  name!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  description!: string | null;

  @ApiProperty({ example: 199.99, type: Number })
  price!: number;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;
}

export class CreateProductBody {
  @ApiProperty({ example: 'SKU-1001', maxLength: 64 })
  sku!: string;

  @ApiProperty({ example: 'Sensor Kit', maxLength: 255 })
  name!: string;

  @ApiPropertyOptional({ nullable: true, maxLength: 2000 })
  description?: string | null;

  @ApiProperty({ example: 199.99, type: Number, minimum: 0 })
  price!: number;

  @ApiPropertyOptional({ default: true })
  isActive?: boolean;
}

export class UpdateProductBody {
  @ApiPropertyOptional({ example: 'SKU-1001', maxLength: 64 })
  sku?: string;

  @ApiPropertyOptional({ example: 'Sensor Kit', maxLength: 255 })
  name?: string;

  @ApiPropertyOptional({ nullable: true, maxLength: 2000 })
  description?: string | null;

  @ApiPropertyOptional({ example: 199.99, type: Number, minimum: 0 })
  price?: number;

  @ApiPropertyOptional()
  isActive?: boolean;
}

export class CreateRoleBody {
  @ApiProperty({
    example: 'مدیر کل',
    maxLength: 128,
    description: 'Display label (any language).',
  })
  label!: Role['label'];

  @ApiProperty({
    allOf: [roleIdRef],
    description: 'Unique slug (e.g. super-admin).',
  })
  value!: Role['value'];

  @ApiPropertyOptional({ nullable: true, maxLength: 2000 })
  description?: string | null;

  @ApiPropertyOptional({
    type: 'array',
    items: permissionIdRef,
    description: 'Permission IDs to attach to the role.',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  permissionIds?: Permission['id'][];
}

export class UpdateRoleBody {
  @ApiPropertyOptional({
    example: 'مدیر کل',
    maxLength: 128,
    description: 'Display label of the role (any language).',
  })
  label?: Role['label'];

  @ApiPropertyOptional({
    allOf: [roleIdRef],
    description: 'Unique slug. When provided, replaces the previous value.',
  })
  value?: Role['value'];

  @ApiPropertyOptional({
    nullable: true,
    maxLength: 2000,
    description: 'Optional human-readable description of the role.',
  })
  description?: string | null;

  @ApiPropertyOptional({
    type: 'array',
    items: permissionIdRef,
    description:
      'Full list of permission IDs to assign. When provided, replaces the previous set.',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  permissionIds?: Permission['id'][];
}

export class SetRolePermissionsBody {
  @ApiProperty({
    type: 'array',
    items: permissionIdRef,
    description: "Permission IDs that replace the role's current permissions.",
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  permissionIds!: Permission['id'][];
}

export class CreateUserBody {
  @ApiProperty({ example: 'user@example.com', maxLength: 320 })
  email!: string;

  @ApiProperty({ example: 'Ada Lovelace', maxLength: 255 })
  name!: string;

  @ApiProperty({
    example: 'securePass1',
    minLength: 8,
    maxLength: 128,
    format: 'password',
  })
  password!: string;

  @ApiPropertyOptional({ default: true })
  isActive?: boolean;

  @ApiPropertyOptional({
    type: 'array',
    items: roleIdRef,
    description: 'Role IDs to assign to the user.',
    example: ['super-admin'],
  })
  roleIds?: Role['value'][];
}

export class UpdateUserBody {
  @ApiPropertyOptional({ example: 'Ada Lovelace', maxLength: 255 })
  name?: string;

  @ApiPropertyOptional({
    minLength: 8,
    maxLength: 128,
    format: 'password',
  })
  password?: string;

  @ApiPropertyOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    type: 'array',
    items: roleIdRef,
    description:
      'Full list of role IDs to assign. When provided, replaces the previous set.',
    example: ['super-admin'],
  })
  roleIds?: Role['value'][];
}

export class SetUserRolesBody {
  @ApiProperty({
    type: 'array',
    items: roleIdRef,
    description: "Role IDs that replace the user's current roles.",
    example: ['super-admin'],
  })
  roleIds!: Role['value'][];
}

export class LoginBody {
  @ApiProperty({ example: 'super-admin@localhost.ir', maxLength: 320 })
  email!: string;

  @ApiProperty({
    example: 'UTMwBgi6vcpsXZc',
    minLength: 8,
    maxLength: 128,
    format: 'password',
  })
  password!: string;
}

export class UpdateProfileBody {
  @ApiProperty({ example: 'user@example.com', maxLength: 320 })
  email!: string;

  @ApiProperty({ example: 'Ada Lovelace', maxLength: 255 })
  name!: string;

  @ApiPropertyOptional({
    minLength: 8,
    maxLength: 128,
    format: 'password',
    description: 'Omit to keep the current password.',
  })
  password?: string;
}

export class AuthUserResponse {
  @ApiProperty({ allOf: [userIdRef] })
  id!: User['id'];

  @ApiProperty({ example: 'super-admin@localhost.ir' })
  email!: string;

  @ApiProperty({ example: 'super-admin' })
  name!: string;

  @ApiProperty()
  isActive!: boolean;
}

export class AbilityRuleResponse {
  @ApiProperty({
    enum: [...PERMISSION_ACTIONS, 'manage'],
    example: PermissionAction.Update,
  })
  action!: string;

  @ApiProperty({
    enum: [...PERMISSION_RESOURCES, 'all'],
    example: PermissionResource.Products,
  })
  subject!: string;
}

export class AuthMeResponse {
  @ApiProperty({
    type: () => AuthUserResponse,
    description: 'Session identity only — no roles/permissions trees.',
  })
  user!: AuthUserResponse;

  @ApiProperty({
    type: () => [AbilityRuleResponse],
    description:
      'Effective CASL rules from permission.resource + permission.action. Super-admin: manage/all.',
  })
  abilities!: AbilityRuleResponse[];

  @ApiProperty({
    type: [String],
    example: ['*', 'products:read'],
    description:
      'Derived resource:action keys (display). UI must gate on abilities, not these strings.',
  })
  permissionCodes!: string[];
}

export class LoginResponse extends AuthMeResponse {
  @ApiProperty({
    description: 'JWT access token (refresh is HttpOnly cookie only)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({ example: 'Bearer', enum: ['Bearer'] })
  tokenType!: 'Bearer';
}

/** Shared pagination fields for list endpoints (antdv Table remote mode). */
export class PaginatedMeta {
  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  pageSize!: number;
}

export class PaginatedUsersResponse extends PaginatedMeta {
  @ApiProperty({ type: () => [UserResponse] })
  items!: UserResponse[];
}

export class PaginatedRolesResponse extends PaginatedMeta {
  @ApiProperty({ type: () => [RoleResponse] })
  items!: RoleResponse[];
}

export class PaginatedPermissionsResponse extends PaginatedMeta {
  @ApiProperty({ type: () => [PermissionResponse] })
  items!: PermissionResponse[];
}

export class PaginatedProductsResponse extends PaginatedMeta {
  @ApiProperty({ type: () => [ProductResponse] })
  items!: ProductResponse[];
}

/** Uniform ApiResult envelope fields (matches @vue-nestjs-admin-template/schemas ApiResult). */
export class ApiResultBase {
  @ApiProperty({ example: 200 })
  status!: number;

  @ApiProperty({ type: [String], example: [] })
  message!: string[];

  @ApiProperty({ example: true })
  isSuccess!: boolean;
}

export class ApiResultVoidResponse extends ApiResultBase {}

export class ApiResultStringResponse extends ApiResultBase {
  @ApiPropertyOptional({ type: String, example: 'Hello from API' })
  data?: string;
}

export class ApiResultUserResponse extends ApiResultBase {
  @ApiPropertyOptional({ type: () => UserResponse })
  data?: UserResponse;
}

export class ApiResultRoleResponse extends ApiResultBase {
  @ApiPropertyOptional({ type: () => RoleResponse })
  data?: RoleResponse;
}

export class ApiResultPermissionResponse extends ApiResultBase {
  @ApiPropertyOptional({ type: () => PermissionResponse })
  data?: PermissionResponse;
}

export class ApiResultProductResponse extends ApiResultBase {
  @ApiPropertyOptional({ type: () => ProductResponse })
  data?: ProductResponse;
}

export class ApiResultPaginatedUsersResponse extends ApiResultBase {
  @ApiPropertyOptional({ type: () => PaginatedUsersResponse })
  data?: PaginatedUsersResponse;
}

export class ApiResultPaginatedRolesResponse extends ApiResultBase {
  @ApiPropertyOptional({ type: () => PaginatedRolesResponse })
  data?: PaginatedRolesResponse;
}

export class ApiResultPaginatedPermissionsResponse extends ApiResultBase {
  @ApiPropertyOptional({ type: () => PaginatedPermissionsResponse })
  data?: PaginatedPermissionsResponse;
}

export class ApiResultPaginatedProductsResponse extends ApiResultBase {
  @ApiPropertyOptional({ type: () => PaginatedProductsResponse })
  data?: PaginatedProductsResponse;
}

export class ApiResultAuthMeResponse extends ApiResultBase {
  @ApiPropertyOptional({ type: () => AuthMeResponse })
  data?: AuthMeResponse;
}

export class ApiResultLoginResponse extends ApiResultBase {
  @ApiPropertyOptional({ type: () => LoginResponse })
  data?: LoginResponse;
}
