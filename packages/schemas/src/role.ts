import { z } from 'zod';
import {
  permissionIdListSchema,
  permissionIdSchema,
  roleLabelSchema,
  roleValueSchema,
} from './common';

export const createRoleSchema = z
  .object({
    label: roleLabelSchema,
    value: roleValueSchema,
    description: z.string().trim().max(2000).nullable().optional(),
    permissionIds: permissionIdListSchema.optional(),
  })
  .strict();

export const updateRoleSchema = z
  .object({
    label: roleLabelSchema.optional(),
    value: roleValueSchema.optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    permissionIds: permissionIdListSchema.optional(),
  })
  .strict();

export const setRolePermissionsSchema = z
  .object({
    permissionIds: z.array(permissionIdSchema),
  })
  .strict();

export type CreateRoleDto = z.infer<typeof createRoleSchema>;
export type UpdateRoleDto = z.infer<typeof updateRoleSchema>;
export type SetRolePermissionsDto = z.infer<typeof setRolePermissionsSchema>;
