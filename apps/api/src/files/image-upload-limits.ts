import {
  IMAGE_UPLOAD,
  isAllowedImageMime as sharedIsAllowedImageMime,
} from '@maghami-system/schemas';

/** Plain primitives for Nest decorators / Multer limits. */
export const IMAGE_UPLOAD_MAX_BYTES: number = IMAGE_UPLOAD.maxBytes;

export const IMAGE_UPLOAD_MIME_LABEL: string =
  IMAGE_UPLOAD.mimeTypes.join(', ');

export function isAllowedImageMime(value: string): boolean {
  return sharedIsAllowedImageMime(value);
}
