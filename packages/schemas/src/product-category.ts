import { z } from 'zod';
import { catalogCodeSchema } from './product-coding-common';

export const createProductCategorySchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    code: catalogCodeSchema,
    description: z.string().trim().max(2000).nullable().optional(),
    parentId: z.string().uuid().nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const updateProductCategorySchema = createProductCategorySchema
  .partial()
  .strict();

export type CreateProductCategoryDto = z.infer<
  typeof createProductCategorySchema
>;
export type UpdateProductCategoryDto = z.infer<
  typeof updateProductCategorySchema
>;
