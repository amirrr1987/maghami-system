import type { InjectionToken } from '@nestjs/common';
import type { Readable } from 'node:stream';

/** Blob backend for uploaded files (local disk). */
export interface FileStorage {
  /** Persist bytes under a unique file name. */
  put(storedName: string, body: Buffer, mimeType: string): Promise<void>;

  /** Open a readable stream; throw if missing. */
  openReadStream(storedName: string): Promise<Readable>;

  /** Delete file if present (idempotent). */
  remove(storedName: string): Promise<void>;
}

export const FILE_STORAGE: InjectionToken<FileStorage> = Symbol('FILE_STORAGE');
