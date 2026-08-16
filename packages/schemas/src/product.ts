import { z } from 'zod';

export const createProductSchema = z
  .object({
    sku: z
      .string()
      .trim()
      .min(1)
      .max(64)
      .regex(/^[A-Za-z0-9._-]+$/, {
        message: 'sku may contain letters, digits, ., _, -',
      }),
    name: z.string().trim().min(1).max(255),
    description: z.string().trim().max(2000).nullable().optional(),
    price: z.number().nonnegative().finite(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const updateProductSchema = createProductSchema.partial().strict();

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
