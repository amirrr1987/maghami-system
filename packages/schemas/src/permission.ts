import { z } from 'zod';

/** CASL catalog subjects (page/API resources). */
export enum PermissionResource {
  Users = 'users',
  Roles = 'roles',
  Permissions = 'permissions',
  Files = 'files',
  Products = 'products',
  ProductCategories = 'product-categories',
  ProductBrands = 'product-brands',
  ProductUnits = 'product-units',
  ProductAttributes = 'product-attributes',
  ProductCodePatterns = 'product-code-patterns',
}

/** CASL catalog actions (no write↔create/update aliases). */
export enum PermissionAction {
  Read = 'read',
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
}

export const PERMISSION_RESOURCES = [
  PermissionResource.Users,
  PermissionResource.Roles,
  PermissionResource.Permissions,
  PermissionResource.Files,
  PermissionResource.Products,
  PermissionResource.ProductCategories,
  PermissionResource.ProductBrands,
  PermissionResource.ProductUnits,
  PermissionResource.ProductAttributes,
  PermissionResource.ProductCodePatterns,
] as const satisfies readonly PermissionResource[];

/** Catalog resources created on API bootstrap. */
export const SEEDED_PERMISSION_RESOURCES = PERMISSION_RESOURCES;

export const PERMISSION_ACTIONS = [
  PermissionAction.Read,
  PermissionAction.Create,
  PermissionAction.Update,
  PermissionAction.Delete,
] as const satisfies readonly PermissionAction[];

export function isPermissionResource(
  value: string,
): value is PermissionResource {
  return (PERMISSION_RESOURCES as readonly string[]).includes(value);
}

export function isPermissionAction(value: string): value is PermissionAction {
  return (PERMISSION_ACTIONS as readonly string[]).includes(value);
}

/** Display / debug key — not a DB column. */
export function permissionKey(
  resource: PermissionResource,
  action: PermissionAction,
): string {
  return `${resource}:${action}`;
}

export const permissionResourceSchema = z.nativeEnum(PermissionResource, {
  errorMap: () => ({ message: 'resource must be a known catalog subject' }),
});

export const permissionActionSchema = z.nativeEnum(PermissionAction, {
  errorMap: () => ({ message: 'action must be a known catalog action' }),
});

export const createPermissionSchema = z
  .object({
    resource: permissionResourceSchema,
    action: permissionActionSchema,
    name: z.string().trim().min(1).max(255),
    description: z.string().trim().max(2000).nullable().optional(),
  })
  .strict();

export const updatePermissionSchema = createPermissionSchema.partial().strict();

export type CreatePermissionDto = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionDto = z.infer<typeof updatePermissionSchema>;
