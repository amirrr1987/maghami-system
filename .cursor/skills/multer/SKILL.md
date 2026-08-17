---
name: multer
description: >
  Type-safe Multer multipart uploads in NestJS (apps/api) — FileInterceptor,
  memoryStorage, Express.Multer.File, IMAGE_UPLOAD limits from shared schemas.
  Use when adding or changing file upload endpoints.
---

# Multer (type-safe, NestJS)

Docs: [Multer](https://github.com/expressjs/multer) · Nest: [File upload](https://docs.nestjs.com/techniques/file-upload).

**Stack:** `multer` + `@types/multer` in `apps/api`. Limits/MIME live in **`@maghami-system/schemas`** (`IMAGE_UPLOAD`).

## Source of truth

- Upload limits: `IMAGE_UPLOAD` / `isAllowedImageMime` from `@maghami-system/schemas`
- Request file type: `Express.Multer.File` (from `@types/multer` / Express)
- Nest helpers: `FileInterceptor`, `UploadedFile` from `@nestjs/platform-express`

Do **not** invent parallel max-size or mime lists in the controller.

## Pattern (this repo)

```ts
import { FileInterceptor } from '@nestjs/platform-express'
import { IMAGE_UPLOAD_MAX_BYTES } from './image-upload-limits'

@UseInterceptors(
  FileInterceptor('file', {
    limits: { fileSize: IMAGE_UPLOAD_MAX_BYTES },
  }),
)
```

Omit `storage` so Multer keeps the file in memory (`buffer`). Do not use
`import { memoryStorage } from 'multer'` — `@types/multer` is `export =` and that
named import becomes an error type under TypeScript-ESLint.

Phase 1 stores to local disk (`UPLOAD_DIR`), serves via authenticated `GET /files/:id/content` (no public CDN URL).

## Anti-patterns

- `any` for uploaded file
- Hardcoded `5mb` / mime arrays outside `IMAGE_UPLOAD`
- Serving uploads as static public files without auth
