import { z } from 'zod';
import { catalogCodeSchema } from './product-coding-common';

export const createProductBrandSchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    code: catalogCodeSchema,
    logoUrl: z.string().trim().url().max(2048).nullable().optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const updateProductBrandSchema = createProductBrandSchema
  .partial()
  .strict();

export type CreateProductBrandDto = z.infer<typeof createProductBrandSchema>;
export type UpdateProductBrandDto = z.infer<typeof updateProductBrandSchema>;
