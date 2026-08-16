import { z } from 'zod';
import { emailSchema, roleIdListSchema, roleIdSchema } from './common';

export const createUserSchema = z
  .object({
    email: emailSchema,
    name: z.string().trim().min(1).max(255),
    password: z.string().min(8).max(128),
    isActive: z.boolean().optional(),
    roleIds: roleIdListSchema.optional(),
  })
  .strict();

/** Admin update — email is immutable after create (self-service uses profile). */
export const updateUserSchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    password: z.string().min(8).max(128).optional(),
    isActive: z.boolean().optional(),
    roleIds: roleIdListSchema.optional(),
  })
  .strict();

export const setUserRolesSchema = z
  .object({
    roleIds: z.array(roleIdSchema),
  })
  .strict();

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type SetUserRolesDto = z.infer<typeof setUserRolesSchema>;
