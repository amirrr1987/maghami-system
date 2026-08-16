import { z } from 'zod';
import { productBarcodeSchema, productSkuSchema } from './product-coding-common';

export const productAttributeValueInputSchema = z
  .object({
    attributeId: z.string().uuid(),
    /** Stored as string; NUMBER/BOOLEAN/SELECT validated in service against attribute type. */
    value: z.string().trim().max(4000),
  })
  .strict();

export const createProductSchema = z
  .object({
    /** Omit to auto-generate from category ProductCodePattern (or global fallback). */
    sku: productSkuSchema.optional(),
    name: z.string().trim().min(1).max(255),
    categoryId: z.string().uuid(),
    brandId: z.string().uuid().nullable().optional(),
    unitId: z.string().uuid().nullable().optional(),
    barcode: productBarcodeSchema.nullable().optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    /** Kept for backward compatibility with the existing products UI. */
    price: z.number().nonnegative().finite().optional(),
    isActive: z.boolean().optional(),
    attributeValues: z.array(productAttributeValueInputSchema).max(100).optional(),
  })
  .strict();

export const updateProductSchema = z
  .object({
    sku: productSkuSchema.optional(),
    name: z.string().trim().min(1).max(255).optional(),
    categoryId: z.string().uuid().optional(),
    brandId: z.string().uuid().nullable().optional(),
    unitId: z.string().uuid().nullable().optional(),
    barcode: productBarcodeSchema.nullable().optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    price: z.number().nonnegative().finite().optional(),
    isActive: z.boolean().optional(),
    attributeValues: z.array(productAttributeValueInputSchema).max(100).optional(),
  })
  .strict();

/** Optional list filters (paginated products). */
export const productListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional(),
    pageSize: z.coerce.number().int().min(1).max(100).optional(),
    q: z.string().trim().max(255).optional(),
    categoryId: z.string().uuid().optional(),
    brandId: z.string().uuid().optional(),
    isActive: z
      .union([z.boolean(), z.enum(['true', 'false'])])
      .optional()
      .transform((value) => {
        if (value === undefined) return undefined;
        if (typeof value === 'boolean') return value;
        return value === 'true';
      }),
  })
  .transform((query) => ({
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 10,
    q: query.q,
    categoryId: query.categoryId,
    brandId: query.brandId,
    isActive: query.isActive,
  }));

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
export type ProductAttributeValueInputDto = z.infer<
  typeof productAttributeValueInputSchema
>;
export type ProductListQuery = z.infer<typeof productListQuerySchema>;
