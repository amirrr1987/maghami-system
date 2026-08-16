import { z } from 'zod';
import { catalogCodeSchema } from './product-coding-common';

export const createProductCodePatternSchema = z
  .object({
    categoryId: z.string().uuid(),
    prefix: catalogCodeSchema,
    separator: z.string().max(8).default('-'),
    length: z.number().int().min(1).max(12),
    isActive: z.boolean().optional(),
  })
  .strict();

export const updateProductCodePatternSchema = z
  .object({
    categoryId: z.string().uuid().optional(),
    prefix: catalogCodeSchema.optional(),
    separator: z.string().max(8).optional(),
    length: z.number().int().min(1).max(12).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export type CreateProductCodePatternDto = z.infer<
  typeof createProductCodePatternSchema
>;
export type UpdateProductCodePatternDto = z.infer<
  typeof updateProductCodePatternSchema
>;
