import type { OpenAPIObject } from '@nestjs/swagger';

/**
 * Standalone OpenAPI id schemas (stable for Swagger/codegen).
 * TypeScript side still uses Permission['id'] / Role['value'] / User['id'].
 */
export const openApiIdSchemas = {
  PermissionId: {
    type: 'string',
    format: 'uuid',
    description: 'Unique identifier of a permission (Permission.id).',
    example: '550e8400-e29b-41d4-a716-446655440000',
  },
  RoleId: {
    type: 'string',
    pattern: '^[a-z][a-z0-9_-]*$',
    minLength: 1,
    maxLength: 128,
    description: 'Unique role slug (Role.value). Display name is Role.label.',
    example: 'super-admin',
  },
  UserId: {
    type: 'string',
    format: 'uuid',
    description: 'Unique identifier of a user (User.id).',
    example: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
  },
  ProductId: {
    type: 'string',
    format: 'uuid',
    description: 'Unique identifier of a product (Product.id).',
    example: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
  },
} as const;

/** `$ref` for ApiProperty `items` / `allOf` (not for `@ApiParam` — Nest types SchemaObject only). */
export const permissionIdRef = {
  $ref: '#/components/schemas/PermissionId',
};

export const roleIdRef = {
  $ref: '#/components/schemas/RoleId',
};

export const userIdRef = {
  $ref: '#/components/schemas/UserId',
};

export const productIdRef = {
  $ref: '#/components/schemas/ProductId',
};

/** Register id schemas on the generated OpenAPI 3.0 document. */
export function registerOpenApiIdSchemas(document: OpenAPIObject): void {
  document.components ??= {};
  document.components.schemas = {
    ...openApiIdSchemas,
    ...document.components.schemas,
  };
}
