import { z } from 'zod';
import { catalogCodeSchema } from './product-coding-common';

export const createProductUnitSchema = z
  .object({
    name: z.string().trim().min(1).max(128),
    code: catalogCodeSchema,
    symbol: z.string().trim().min(1).max(32),
    isActive: z.boolean().optional(),
  })
  .strict();

export const updateProductUnitSchema = createProductUnitSchema
  .partial()
  .strict();

export type CreateProductUnitDto = z.infer<typeof createProductUnitSchema>;
export type UpdateProductUnitDto = z.infer<typeof updateProductUnitSchema>;
