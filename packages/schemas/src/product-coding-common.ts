import { z } from 'zod';

/** Short catalog code (category / brand / unit / attribute / pattern prefix). */
export const catalogCodeSchema = z
  .string()
  .trim()
  .min(1)
  .max(32)
  .regex(/^[A-Za-z0-9_-]+$/, {
    message: 'code may contain letters, digits, _, -',
  });

/** Product SKU wire format (manual override or generated). */
export const productSkuSchema = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z0-9._-]+$/, {
    message: 'sku may contain letters, digits, ., _, -',
  });

export const productBarcodeSchema = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z0-9._-]+$/, {
    message: 'barcode may contain letters, digits, ., _, -',
  });

export const productAttributeTypeSchema = z.enum([
  'TEXT',
  'NUMBER',
  'SELECT',
  'BOOLEAN',
]);

export type ProductAttributeType = z.infer<typeof productAttributeTypeSchema>;
