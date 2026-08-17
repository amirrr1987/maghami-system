import { z } from 'zod';

/**
 * Single source of truth for image upload limits (API Multer + web UI).
 * Change here to tighten/loosen format or size later.
 */
export const IMAGE_UPLOAD = {
  maxBytes: 5 * 1024 * 1024,
  mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  extensions: ['.jpg', '.jpeg', '.png', '.webp'] as const,
} as const;

export type ImageUploadMimeType = (typeof IMAGE_UPLOAD.mimeTypes)[number];

export function isAllowedImageMime(
  value: string,
): value is ImageUploadMimeType {
  return (IMAGE_UPLOAD.mimeTypes as readonly string[]).includes(value);
}

export const fileIdSchema = z.string().uuid();

export const storedFileSchema = z
  .object({
    id: fileIdSchema,
    originalName: z.string(),
    title: z.string(),
    alt: z.string(),
    mimeType: z.string(),
    sizeBytes: z.number().int().nonnegative(),
    folderId: fileIdSchema.nullable(),
    sortOrder: z.number().int(),
    createdAt: z.string(),
  })
  .strict();

export type StoredFileDto = z.infer<typeof storedFileSchema>;

/** Metadata collected at upload time (multipart fields alongside `file`). */
export const uploadFileMetaSchema = z
  .object({
    title: z.string().trim().min(1).max(255),
    alt: z.string().trim().max(255).optional().default(''),
  })
  .strict();

export type UploadFileMetaDto = z.infer<typeof uploadFileMetaSchema>;

/** Edit title/alt after upload. */
export const updateFileMetaSchema = uploadFileMetaSchema;
export type UpdateFileMetaDto = UploadFileMetaDto;

export const bulkDeleteFilesSchema = z
  .object({
    ids: z.array(fileIdSchema).min(1).max(100),
  })
  .strict();

export type BulkDeleteFilesDto = z.infer<typeof bulkDeleteFilesSchema>;

export const fileStatsSchema = z
  .object({
    totalCount: z.number().int().nonnegative(),
    totalSizeBytes: z.number().int().nonnegative(),
    folderCount: z.number().int().nonnegative(),
  })
  .strict();

export type FileStats = z.infer<typeof fileStatsSchema>;

export const fileFolderSchema = z
  .object({
    id: fileIdSchema,
    name: z.string().min(1).max(128),
    parentId: fileIdSchema.nullable(),
    createdAt: z.string(),
  })
  .strict();

export type FileFolderDto = z.infer<typeof fileFolderSchema>;

export const createFileFolderSchema = z
  .object({
    name: z.string().trim().min(1).max(128),
    /** Omit or null → top-level folder */
    parentId: fileIdSchema.nullable().optional(),
  })
  .strict()
  .transform((dto) => ({
    name: dto.name,
    parentId: dto.parentId ?? null,
  }));

export type CreateFileFolderDto = z.infer<typeof createFileFolderSchema>;

export const updateFileFolderSchema = z
  .object({
    name: z.string().trim().min(1).max(128),
  })
  .strict();

export type UpdateFileFolderDto = z.infer<typeof updateFileFolderSchema>;

export const reorderFilesSchema = z
  .object({
    folderId: fileIdSchema.nullable(),
    fileIds: z.array(fileIdSchema).max(500),
  })
  .strict();

export type ReorderFilesDto = z.infer<typeof reorderFilesSchema>;

export const moveFileSchema = z
  .object({
    folderId: fileIdSchema.nullable(),
  })
  .strict();

export type MoveFileDto = z.infer<typeof moveFileSchema>;

/** Blob backend (local disk only). */
export const storageDriverSchema = z.literal('local');
export type StorageDriver = z.infer<typeof storageDriverSchema>;

export const storageInfoSchema = z
  .object({
    driver: storageDriverSchema,
    /** Human label for UI, e.g. Multer → local disk */
    pipeline: z.string(),
    uploadMaxBytes: z.number().int().positive(),
    mimeTypes: z.array(z.string()).min(1),
  })
  .strict();

export type StorageInfo = z.infer<typeof storageInfoSchema>;

/** Paginated files list + optional name search + folder scope. */
export const filesListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional(),
    pageSize: z.coerce.number().int().min(1).max(100).optional(),
    q: z.string().trim().max(128).optional(),
    /** `root` or omit → null folder; otherwise folder uuid */
    folderId: z
      .union([z.literal('root'), z.string().uuid()])
      .optional(),
  })
  .transform((query) => ({
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 10,
    q: query.q && query.q.length > 0 ? query.q : undefined,
    folderId:
      query.folderId === undefined || query.folderId === 'root'
        ? null
        : query.folderId,
  }));

export type FilesListQuery = z.infer<typeof filesListQuerySchema>;
