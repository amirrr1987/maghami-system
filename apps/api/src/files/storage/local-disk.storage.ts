import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createReadStream,
  existsSync,
  mkdirSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import type { Readable } from 'node:stream';
import type { FileStorage } from './file-storage';

@Injectable()
export class LocalDiskStorage implements FileStorage {
  private readonly uploadDir: string;

  constructor(config: ConfigService) {
    this.uploadDir =
      config.get<string>('UPLOAD_DIR')?.trim() ||
      join(process.cwd(), 'uploads');
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  put(storedName: string, body: Buffer): Promise<void> {
    writeFileSync(join(this.uploadDir, storedName), body);
    return Promise.resolve();
  }

  openReadStream(storedName: string): Promise<Readable> {
    const absolutePath = join(this.uploadDir, storedName);
    if (!existsSync(absolutePath)) {
      throw new NotFoundException(`File content missing: ${storedName}`);
    }
    return Promise.resolve(createReadStream(absolutePath));
  }

  remove(storedName: string): Promise<void> {
    const absolutePath = join(this.uploadDir, storedName);
    if (existsSync(absolutePath)) {
      unlinkSync(absolutePath);
    }
    return Promise.resolve();
  }
}
