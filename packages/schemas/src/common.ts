import { z } from 'zod';
import type { Permission, Product, Role, User } from './entities';

/** Display label — any language (e.g. Persian); not unique. */
export const roleLabelSchema: z.ZodType<Role['label']> = z
  .string()
  .trim()
  .min(1)
  .max(128);

/** Unique role slug — TS equivalent: `Role['value']` (not UUID). */
export const roleValueSchema: z.ZodType<Role['value']> = z
  .string()
  .trim()
  .min(1)
  .max(128)
  .regex(/^[a-z][a-z0-9_-]*$/, {
    message: 'value must be a lowercase slug (e.g. super-admin)',
  });

/** Single id — TS equivalent: `Permission['id']` / `Role['value']` / `User['id']`. */
export const permissionIdSchema: z.ZodType<Permission['id']> = z.string().uuid();
export const roleIdSchema = roleValueSchema;
export const userIdSchema: z.ZodType<User['id']> = z.string().uuid();
export const productIdSchema: z.ZodType<Product['id']> = z.string().uuid();

/** Assignment lists — TS equivalent: `Permission['id'][]` / `Role['value'][]`. */
export const permissionIdListSchema = z.array(permissionIdSchema).default([]);
export const roleIdListSchema = z.array(roleIdSchema).default([]);

/** Email — standard Zod email (max 320). */
export const emailSchema = z.string().trim().email().max(320);
