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
} from '@maghami-system/schemas';
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
    example: PermissionResource.Users,
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
    example: PermissionResource.Users,
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

  @ApiProperty({ example: 'ELEC-000042' })
  sku!: string;

  @ApiProperty({ example: 'Sensor Kit' })
  name!: string;

  @ApiPropertyOptional({ nullable: true, type: String, format: 'uuid' })
  categoryId!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String, format: 'uuid' })
  brandId!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String, format: 'uuid' })
  unitId!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    type: String,
    example: '6260123456789',
  })
  barcode!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  description!: string | null;

  @ApiProperty({ example: 199.99, type: Number })
  price!: number;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ type: () => [ProductAttributeValueResponse] })
  attributeValues!: ProductAttributeValueResponse[];

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;
}

export class ProductAttributeValueResponse {
  @ApiProperty({ type: String, format: 'uuid' })
  id!: string;

  @ApiProperty({ type: String, format: 'uuid' })
  productId!: string;

  @ApiProperty({ type: String, format: 'uuid' })
  attributeId!: string;

  @ApiProperty({ example: 'red' })
  value!: string;
}

export class ProductAttributeValueInputBody {
  @ApiProperty({ type: String, format: 'uuid' })
  attributeId!: string;

  @ApiProperty({ example: 'red' })
  value!: string;
}

export class CreateProductBody {
  @ApiPropertyOptional({
    example: 'ELEC-000042',
    maxLength: 64,
    description: 'Omit to auto-generate from category code pattern',
  })
  sku?: string;

  @ApiProperty({ example: 'Sensor Kit', maxLength: 255 })
  name!: string;

  @ApiProperty({ type: String, format: 'uuid' })
  categoryId!: string;

  @ApiPropertyOptional({ nullable: true, type: String, format: 'uuid' })
  brandId?: string | null;

  @ApiPropertyOptional({ nullable: true, type: String, format: 'uuid' })
  unitId?: string | null;

  @ApiPropertyOptional({ nullable: true, maxLength: 64 })
  barcode?: string | null;

  @ApiPropertyOptional({ nullable: true, maxLength: 2000 })
  description?: string | null;

  @ApiPropertyOptional({ example: 199.99, type: Number, minimum: 0 })
  price?: number;

  @ApiPropertyOptional({ default: true })
  isActive?: boolean;

  @ApiPropertyOptional({ type: () => [ProductAttributeValueInputBody] })
  attributeValues?: ProductAttributeValueInputBody[];
}

export class UpdateProductBody {
  @ApiPropertyOptional({ example: 'ELEC-000042', maxLength: 64 })
  sku?: string;

  @ApiPropertyOptional({ example: 'Sensor Kit', maxLength: 255 })
  name?: string;

  @ApiPropertyOptional({ type: String, format: 'uuid' })
  categoryId?: string;

  @ApiPropertyOptional({ nullable: true, type: String, format: 'uuid' })
  brandId?: string | null;

  @ApiPropertyOptional({ nullable: true, type: String, format: 'uuid' })
  unitId?: string | null;

  @ApiPropertyOptional({ nullable: true, maxLength: 64 })
  barcode?: string | null;

  @ApiPropertyOptional({ nullable: true, maxLength: 2000 })
  description?: string | null;

  @ApiPropertyOptional({ example: 199.99, type: Number, minimum: 0 })
  price?: number;

  @ApiPropertyOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ type: () => [ProductAttributeValueInputBody] })
  attributeValues?: ProductAttributeValueInputBody[];
}

export class SkuPreviewResponse {
  @ApiProperty({ example: 'ELEC-000042' })
  sku!: string;
}

export class ProductCategoryResponse {
  @ApiProperty({ type: String, format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Electronics' })
  name!: string;

  @ApiProperty({ example: 'ELEC' })
  code!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  description!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String, format: 'uuid' })
  parentId!: string | null;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;
}

export class ProductCategoryTreeNodeResponse extends ProductCategoryResponse {
  @ApiProperty({ type: () => [ProductCategoryTreeNodeResponse] })
  children!: ProductCategoryTreeNodeResponse[];
}

export class CreateProductCategoryBody {
  @ApiProperty({ example: 'Electronics', maxLength: 255 })
  name!: string;

  @ApiProperty({ example: 'ELEC', maxLength: 32 })
  code!: string;

  @ApiPropertyOptional({ nullable: true, maxLength: 2000 })
  description?: string | null;

  @ApiPropertyOptional({ nullable: true, type: String, format: 'uuid' })
  parentId?: string | null;

  @ApiPropertyOptional({ default: true })
  isActive?: boolean;
}

export class UpdateProductCategoryBody {
  @ApiPropertyOptional({ example: 'Electronics', maxLength: 255 })
  name?: string;

  @ApiPropertyOptional({ example: 'ELEC', maxLength: 32 })
  code?: string;

  @ApiPropertyOptional({ nullable: true, maxLength: 2000 })
  description?: string | null;

  @ApiPropertyOptional({ nullable: true, type: String, format: 'uuid' })
  parentId?: string | null;

  @ApiPropertyOptional()
  isActive?: boolean;
}

export class ProductBrandResponse {
  @ApiProperty({ type: String, format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Acme' })
  name!: string;

  @ApiProperty({ example: 'ACME' })
  code!: string;

  @ApiPropertyOptional({ nullable: true, type: String, format: 'uuid' })
  logoFileId!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  description!: string | null;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;
}

export class CreateProductBrandBody {
  @ApiProperty({ example: 'Acme', maxLength: 255 })
  name!: string;

  @ApiProperty({ example: 'ACME', maxLength: 32 })
  code!: string;

  @ApiPropertyOptional({ nullable: true, type: String, format: 'uuid' })
  logoFileId?: string | null;

  @ApiPropertyOptional({ nullable: true, maxLength: 2000 })
  description?: string | null;

  @ApiPropertyOptional({ default: true })
  isActive?: boolean;
}

export class UpdateProductBrandBody {
  @ApiPropertyOptional({ example: 'Acme', maxLength: 255 })
  name?: string;

  @ApiPropertyOptional({ example: 'ACME', maxLength: 32 })
  code?: string;

  @ApiPropertyOptional({ nullable: true, type: String, format: 'uuid' })
  logoFileId?: string | null;

  @ApiPropertyOptional({ nullable: true, maxLength: 2000 })
  description?: string | null;

  @ApiPropertyOptional()
  isActive?: boolean;
}

export class ProductUnitResponse {
  @ApiProperty({ type: String, format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Kilogram' })
  name!: string;

  @ApiProperty({ example: 'KG' })
  code!: string;

  @ApiProperty({ example: 'kg' })
  symbol!: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;
}

export class CreateProductUnitBody {
  @ApiProperty({ example: 'Kilogram', maxLength: 128 })
  name!: string;

  @ApiProperty({ example: 'KG', maxLength: 32 })
  code!: string;

  @ApiProperty({ example: 'kg', maxLength: 32 })
  symbol!: string;

  @ApiPropertyOptional({ default: true })
  isActive?: boolean;
}

export class UpdateProductUnitBody {
  @ApiPropertyOptional({ example: 'Kilogram', maxLength: 128 })
  name?: string;

  @ApiPropertyOptional({ example: 'KG', maxLength: 32 })
  code?: string;

  @ApiPropertyOptional({ example: 'kg', maxLength: 32 })
  symbol?: string;

  @ApiPropertyOptional()
  isActive?: boolean;
}

export class ProductAttributeResponse {
  @ApiProperty({ type: String, format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Color' })
  name!: string;

  @ApiProperty({ example: 'COLOR' })
  code!: string;

  @ApiProperty({ enum: ['TEXT', 'NUMBER', 'SELECT', 'BOOLEAN'] })
  type!: 'TEXT' | 'NUMBER' | 'SELECT' | 'BOOLEAN';

  @ApiPropertyOptional({
    nullable: true,
    type: [String],
    example: ['red', 'blue'],
  })
  options!: string[] | null;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;
}

export class CreateProductAttributeBody {
  @ApiProperty({ example: 'Color', maxLength: 255 })
  name!: string;

  @ApiProperty({ example: 'COLOR', maxLength: 32 })
  code!: string;

  @ApiProperty({ enum: ['TEXT', 'NUMBER', 'SELECT', 'BOOLEAN'] })
  type!: 'TEXT' | 'NUMBER' | 'SELECT' | 'BOOLEAN';

  @ApiPropertyOptional({ nullable: true, type: [String] })
  options?: string[] | null;

  @ApiPropertyOptional({ default: true })
  isActive?: boolean;
}

export class UpdateProductAttributeBody {
  @ApiPropertyOptional({ example: 'Color', maxLength: 255 })
  name?: string;

  @ApiPropertyOptional({ example: 'COLOR', maxLength: 32 })
  code?: string;

  @ApiPropertyOptional({ enum: ['TEXT', 'NUMBER', 'SELECT', 'BOOLEAN'] })
  type?: 'TEXT' | 'NUMBER' | 'SELECT' | 'BOOLEAN';

  @ApiPropertyOptional({ nullable: true, type: [String] })
  options?: string[] | null;

  @ApiPropertyOptional()
  isActive?: boolean;
}

export class ProductCodePatternResponse {
  @ApiProperty({ type: String, format: 'uuid' })
  id!: string;

  @ApiProperty({ type: String, format: 'uuid' })
  categoryId!: string;

  @ApiProperty({ example: 'ELEC' })
  prefix!: string;

  @ApiProperty({ example: '-' })
  separator!: string;

  @ApiProperty({ example: 6 })
  length!: number;

  @ApiProperty({ example: 42 })
  nextSequence!: number;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;
}

export class CreateProductCodePatternBody {
  @ApiProperty({ type: String, format: 'uuid' })
  categoryId!: string;

  @ApiProperty({ example: 'ELEC', maxLength: 32 })
  prefix!: string;

  @ApiPropertyOptional({ example: '-', maxLength: 8, default: '-' })
  separator?: string;

  @ApiProperty({ example: 6, minimum: 1, maximum: 12 })
  length!: number;

  @ApiPropertyOptional({ default: true })
  isActive?: boolean;
}

export class UpdateProductCodePatternBody {
  @ApiPropertyOptional({ type: String, format: 'uuid' })
  categoryId?: string;

  @ApiPropertyOptional({ example: 'ELEC', maxLength: 32 })
  prefix?: string;

  @ApiPropertyOptional({ example: '-', maxLength: 8 })
  separator?: string;

  @ApiPropertyOptional({ example: 6, minimum: 1, maximum: 12 })
  length?: number;

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

  @ApiPropertyOptional({
    nullable: true,
    format: 'uuid',
    description: 'Uploaded file id owned by the current user.',
  })
  avatarFileId?: string | null;
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

  @ApiPropertyOptional({ nullable: true, format: 'uuid' })
  avatarFileId!: string | null;
}

export class StoredFileResponse {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  originalName!: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimeType!: string;

  @ApiProperty({ example: 102400 })
  sizeBytes!: number;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;
}

export class AbilityRuleResponse {
  @ApiProperty({
    enum: [...PERMISSION_ACTIONS, 'manage'],
    example: PermissionAction.Update,
  })
  action!: string;

  @ApiProperty({
    enum: [...PERMISSION_RESOURCES, 'all'],
    example: PermissionResource.Users,
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
    example: ['*', 'users:read'],
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

  @ApiProperty({
    example: 86400,
    description: 'Access JWT lifetime in seconds (`JWT_EXPIRES_IN`)',
  })
  accessTokenExpiresIn!: number;

  @ApiProperty({
    example: 604800,
    description:
      'Refresh JWT / HttpOnly cookie lifetime in seconds (`JWT_REFRESH_EXPIRES_IN`)',
  })
  refreshTokenExpiresIn!: number;
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

export class PaginatedProductCategoriesResponse extends PaginatedMeta {
  @ApiProperty({ type: () => [ProductCategoryResponse] })
  items!: ProductCategoryResponse[];
}

export class PaginatedProductBrandsResponse extends PaginatedMeta {
  @ApiProperty({ type: () => [ProductBrandResponse] })
  items!: ProductBrandResponse[];
}

export class PaginatedProductUnitsResponse extends PaginatedMeta {
  @ApiProperty({ type: () => [ProductUnitResponse] })
  items!: ProductUnitResponse[];
}

export class PaginatedProductAttributesResponse extends PaginatedMeta {
  @ApiProperty({ type: () => [ProductAttributeResponse] })
  items!: ProductAttributeResponse[];
}

export class PaginatedProductCodePatternsResponse extends PaginatedMeta {
  @ApiProperty({ type: () => [ProductCodePatternResponse] })
  items!: ProductCodePatternResponse[];
}

/** Uniform ApiResult envelope fields (matches @maghami-system/schemas ApiResult). */
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

export class ApiResultStoredFileResponse extends ApiResultBase {
  @ApiPropertyOptional({ type: () => StoredFileResponse })
  data?: StoredFileResponse;
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

export class ApiResultProductResponse extends ApiResultBase {
  @ApiPropertyOptional({ type: () => ProductResponse })
  data?: ProductResponse;
}

export class ApiResultPaginatedProductsResponse extends ApiResultBase {
  @ApiPropertyOptional({ type: () => PaginatedProductsResponse })
  data?: PaginatedProductsResponse;
}

export class ApiResultSkuPreviewResponse extends ApiResultBase {
  @ApiPropertyOptional({ type: () => SkuPreviewResponse })
  data?: SkuPreviewResponse;
}

export class ApiResultProductCategoryResponse extends ApiResultBase {
  @ApiPropertyOptional({ type: () => ProductCategoryResponse })
  data?: ProductCategoryResponse;
}

export class ApiResultProductCategoryTreeResponse extends ApiResultBase {
  @ApiPropertyOptional({ type: () => [ProductCategoryTreeNodeResponse] })
  data?: ProductCategoryTreeNodeResponse[];
}

export class ApiResultPaginatedProductCategoriesResponse extends ApiResultBase {
  @ApiPropertyOptional({ type: () => PaginatedProductCategoriesResponse })
  data?: PaginatedProductCategoriesResponse;
}

export class ApiResultProductBrandResponse extends ApiResultBase {
  @ApiPropertyOptional({ type: () => ProductBrandResponse })
  data?: ProductBrandResponse;
}

export class ApiResultPaginatedProductBrandsResponse extends ApiResultBase {
  @ApiPropertyOptional({ type: () => PaginatedProductBrandsResponse })
  data?: PaginatedProductBrandsResponse;
}

export class ApiResultProductUnitResponse extends ApiResultBase {
  @ApiPropertyOptional({ type: () => ProductUnitResponse })
  data?: ProductUnitResponse;
}

export class ApiResultPaginatedProductUnitsResponse extends ApiResultBase {
  @ApiPropertyOptional({ type: () => PaginatedProductUnitsResponse })
  data?: PaginatedProductUnitsResponse;
}

export class ApiResultProductAttributeResponse extends ApiResultBase {
  @ApiPropertyOptional({ type: () => ProductAttributeResponse })
  data?: ProductAttributeResponse;
}

export class ApiResultPaginatedProductAttributesResponse extends ApiResultBase {
  @ApiPropertyOptional({ type: () => PaginatedProductAttributesResponse })
  data?: PaginatedProductAttributesResponse;
}

export class ApiResultProductCodePatternResponse extends ApiResultBase {
  @ApiPropertyOptional({ type: () => ProductCodePatternResponse })
  data?: ProductCodePatternResponse;
}

export class ApiResultPaginatedProductCodePatternsResponse extends ApiResultBase {
  @ApiPropertyOptional({ type: () => PaginatedProductCodePatternsResponse })
  data?: PaginatedProductCodePatternsResponse;
}

export class ApiResultAuthMeResponse extends ApiResultBase {
  @ApiPropertyOptional({ type: () => AuthMeResponse })
  data?: AuthMeResponse;
}

export class ApiResultLoginResponse extends ApiResultBase {
  @ApiPropertyOptional({ type: () => LoginResponse })
  data?: LoginResponse;
}
