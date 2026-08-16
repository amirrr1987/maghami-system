import { z } from 'zod';
import {
  catalogCodeSchema,
  productAttributeTypeSchema,
} from './product-coding-common';

export const createProductAttributeSchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    code: catalogCodeSchema,
    type: productAttributeTypeSchema,
    /** Required for SELECT; ignored for other types (stored null). */
    options: z.array(z.string().trim().min(1).max(128)).max(100).nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.type === 'SELECT') {
      const options = value.options ?? [];
      if (options.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'SELECT attributes require at least one option',
          path: ['options'],
        });
      }
    }
  });

export const updateProductAttributeSchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    code: catalogCodeSchema.optional(),
    type: productAttributeTypeSchema.optional(),
    options: z
      .array(z.string().trim().min(1).max(128))
      .max(100)
      .nullable()
      .optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.type === 'SELECT') {
      const options = value.options ?? [];
      if (options.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'SELECT attributes require at least one option',
          path: ['options'],
        });
      }
    }
  });

export type CreateProductAttributeDto = z.infer<
  typeof createProductAttributeSchema
>;
export type UpdateProductAttributeDto = z.infer<
  typeof updateProductAttributeSchema
>;
