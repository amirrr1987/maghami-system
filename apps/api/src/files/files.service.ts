import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import type { Response } from 'express';
import { ILike, In, IsNull, Repository } from 'typeorm';
import type { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { FileFolder } from './file-folder.entity';
import type {
  BulkDeleteFilesDto,
  CreateFileFolderDto,
  FileFolderDto,
  FileStats,
  FilesListQuery,
  MoveFileDto,
  ReorderFilesDto,
  StorageInfo,
  StoredFileDto,
  UpdateFileFolderDto,
  UpdateFileMetaDto,
  UploadFileMetaDto,
} from './files.types';
import {
  IMAGE_UPLOAD_MAX_BYTES,
  IMAGE_UPLOAD_MIME_LABEL,
  isAllowedImageMime,
} from './image-upload-limits';
import { StoredFile as StoredFileEntity } from './stored-file.entity';
import { FILE_STORAGE, type FileStorage } from './storage/file-storage';
import type { UploadedImageFile } from './uploaded-image-file';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(StoredFileEntity)
    private readonly files: Repository<StoredFileEntity>,
    @InjectRepository(FileFolder)
    private readonly folders: Repository<FileFolder>,
    private readonly usersService: UsersService,
    @Inject(FILE_STORAGE)
    private readonly storage: FileStorage,
  ) {}

  getStorageInfo(): StorageInfo {
    return {
      driver: 'local',
      pipeline: 'Multer → دیسک محلی',
      uploadMaxBytes: IMAGE_UPLOAD_MAX_BYTES,
      mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    };
  }

  async getStats(): Promise<FileStats> {
    const raw = await this.files
      .createQueryBuilder('f')
      .select('COUNT(*)', 'totalCount')
      .addSelect('COALESCE(SUM(f.size_bytes), 0)', 'totalSizeBytes')
      .getRawOne<{ totalCount: string; totalSizeBytes: string }>();
    const folderCount = await this.folders.count();
    return {
      totalCount: Number(raw?.totalCount ?? 0),
      totalSizeBytes: Number(raw?.totalSizeBytes ?? 0),
      folderCount,
    };
  }

  async listFolders(): Promise<FileFolderDto[]> {
    const rows = await this.folders.find({ order: { name: 'ASC' } });
    return rows.map((row) => this.toFolderDto(row));
  }

  async createFolder(
    owner: User,
    dto: CreateFileFolderDto,
  ): Promise<FileFolderDto> {
    if (dto.parentId) {
      await this.findFolderEntity(dto.parentId);
    }
    const entity = this.folders.create({
      name: dto.name,
      parentId: dto.parentId,
      ownerUserId: owner.id,
    });
    const saved = await this.folders.save(entity);
    return this.toFolderDto(saved);
  }

  async updateFolder(
    id: string,
    dto: UpdateFileFolderDto,
  ): Promise<FileFolderDto> {
    const folder = await this.findFolderEntity(id);
    folder.name = dto.name;
    const saved = await this.folders.save(folder);
    return this.toFolderDto(saved);
  }

  async deleteFolder(id: string): Promise<void> {
    const folder = await this.findFolderEntity(id);
    const childFolders = await this.folders.count({
      where: { parentId: id },
    });
    if (childFolders > 0) {
      throw new BadRequestException(
        'Folder has subfolders — delete or move them first',
      );
    }
    const count = await this.files.count({ where: { folderId: id } });
    if (count > 0) {
      throw new BadRequestException(
        'Folder is not empty — move or delete files first',
      );
    }
    await this.folders.delete(folder.id);
  }

  async findPage(query: FilesListQuery): Promise<{
    items: StoredFileDto[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const { page, pageSize, q, folderId } = query;
    const [rows, total] = await this.files.findAndCount({
      where: q
        ? [
            {
              folderId: folderId === null ? IsNull() : folderId,
              originalName: ILike(`%${q}%`),
            },
            {
              folderId: folderId === null ? IsNull() : folderId,
              title: ILike(`%${q}%`),
            },
            {
              folderId: folderId === null ? IsNull() : folderId,
              alt: ILike(`%${q}%`),
            },
          ]
        : {
            folderId: folderId === null ? IsNull() : folderId,
          },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return {
      items: rows.map((row) => this.toDto(row)),
      total,
      page,
      pageSize,
    };
  }

  async saveUpload(
    owner: User,
    file: UploadedImageFile,
    folderId: string | null = null,
    meta: UploadFileMetaDto,
  ): Promise<StoredFileDto> {
    if (!file) {
      throw new BadRequestException('file is required');
    }
    if (!isAllowedImageMime(file.mimetype)) {
      throw new BadRequestException(
        `mime type must be one of: ${IMAGE_UPLOAD_MIME_LABEL}`,
      );
    }
    if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
      throw new BadRequestException(
        `file must be at most ${IMAGE_UPLOAD_MAX_BYTES} bytes`,
      );
    }
    if (folderId) {
      await this.findFolderEntity(folderId);
    }

    const ext = this.extensionForMime(file.mimetype);
    const storedName = `${randomUUID()}${ext}`;
    await this.storage.put(storedName, file.buffer, file.mimetype);

    const maxSort = await this.files
      .createQueryBuilder('f')
      .select('COALESCE(MAX(f.sort_order), -1)', 'max')
      .where(
        folderId === null ? 'f.folder_id IS NULL' : 'f.folder_id = :folderId',
        folderId === null ? {} : { folderId },
      )
      .getRawOne<{ max: string }>();

    const entity = this.files.create({
      originalName: file.originalname?.trim() || storedName,
      title: meta.title,
      alt: meta.alt,
      storedName,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      ownerUserId: owner.id,
      folderId,
      sortOrder: Number(maxSort?.max ?? -1) + 1,
    });
    const saved = await this.files.save(entity);
    return this.toDto(saved);
  }

  async moveFile(id: string, dto: MoveFileDto): Promise<StoredFileDto> {
    const file = await this.findEntity(id);
    const folderId = dto.folderId;
    if (folderId) {
      await this.findFolderEntity(folderId);
    }
    const maxSort = await this.files
      .createQueryBuilder('f')
      .select('COALESCE(MAX(f.sort_order), -1)', 'max')
      .where(
        folderId === null ? 'f.folder_id IS NULL' : 'f.folder_id = :folderId',
        folderId === null ? {} : { folderId },
      )
      .getRawOne<{ max: string }>();
    file.folderId = folderId;
    file.sortOrder = Number(maxSort?.max ?? -1) + 1;
    const saved = await this.files.save(file);
    return this.toDto(saved);
  }

  async updateMeta(id: string, dto: UpdateFileMetaDto): Promise<StoredFileDto> {
    const file = await this.findEntity(id);
    file.title = dto.title;
    file.alt = dto.alt;
    const saved = await this.files.save(file);
    return this.toDto(saved);
  }

  async bulkRemove(
    actor: User,
    dto: BulkDeleteFilesDto,
  ): Promise<{ deleted: number }> {
    let deleted = 0;
    for (const id of dto.ids) {
      const file = await this.findEntity(id);
      this.assertCanDelete(actor, file);
      await this.deleteEntityAndStorage(file);
      deleted += 1;
    }
    return { deleted };
  }

  async reorderFiles(dto: ReorderFilesDto): Promise<void> {
    const folderId = dto.folderId;
    const fileIds = dto.fileIds;
    if (folderId) {
      await this.findFolderEntity(folderId);
    }
    if (fileIds.length === 0) return;

    const rows = await this.files.find({
      where: {
        id: In(fileIds),
        folderId: folderId === null ? IsNull() : folderId,
      },
    });
    if (rows.length !== fileIds.length) {
      throw new BadRequestException(
        'All file ids must exist in the target folder',
      );
    }
    const byId = new Map(rows.map((row) => [row.id, row]));
    for (let index = 0; index < fileIds.length; index += 1) {
      const fileId = fileIds[index];
      if (fileId === undefined) continue;
      const row = byId.get(fileId);
      if (!row) continue;
      row.sortOrder = index;
    }
    await this.files.save([...byId.values()]);
  }

  async findByIds(ids: string[]): Promise<StoredFileEntity[]> {
    if (ids.length === 0) return [];
    const found = await this.files.find({ where: { id: In(ids) } });
    if (found.length !== ids.length) {
      const have = new Set(found.map((f) => f.id));
      const missing = ids.filter((id) => !have.has(id));
      throw new NotFoundException(`Files not found: ${missing.join(', ')}`);
    }
    return found;
  }

  async findEntity(id: string): Promise<StoredFileEntity> {
    const file = await this.files.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException(`File ${id} not found`);
    }
    return file;
  }

  async findFolderEntity(id: string): Promise<FileFolder> {
    const folder = await this.folders.findOne({ where: { id } });
    if (!folder) {
      throw new NotFoundException(`Folder ${id} not found`);
    }
    return folder;
  }

  async findOneForActor(actor: User, id: string): Promise<StoredFileDto> {
    const file = await this.findEntity(id);
    this.assertCanRead(actor);
    return this.toDto(file);
  }

  async assertOwnedBy(
    userId: string,
    fileId: string,
  ): Promise<StoredFileEntity> {
    const file = await this.findEntity(fileId);
    if (file.ownerUserId !== userId) {
      throw new ForbiddenException('File must be owned by the current user');
    }
    return file;
  }

  assertCanRead(actor: User): void {
    if (!actor?.id) {
      throw new ForbiddenException('Not allowed to read this file');
    }
  }

  assertCanDelete(actor: User, file: StoredFileEntity): void {
    if (file.ownerUserId === actor.id) return;
    if (this.usersService.isSuperAdmin(actor)) return;
    const codes = this.usersService.permissionCodesOf(actor);
    if (codes.includes('files:delete') || codes.includes('*')) {
      return;
    }
    throw new ForbiddenException('Not allowed to delete this file');
  }

  async streamContent(
    actor: User,
    id: string,
    response: Response,
  ): Promise<void> {
    const file = await this.findEntity(id);
    this.assertCanRead(actor);
    const stream = await this.storage.openReadStream(file.storedName);
    response.setHeader('Content-Type', file.mimeType);
    response.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(file.originalName)}"`,
    );
    response.setHeader('Cache-Control', 'private, max-age=3600');
    stream.pipe(response);
  }

  async remove(actor: User, id: string): Promise<void> {
    const file = await this.findEntity(id);
    this.assertCanDelete(actor, file);
    await this.deleteEntityAndStorage(file);
  }

  async deleteEntityAndDisk(file: StoredFileEntity): Promise<void> {
    await this.deleteEntityAndStorage(file);
  }

  async deleteEntityAndStorage(file: StoredFileEntity): Promise<void> {
    await this.files.delete(file.id);
    await this.storage.remove(file.storedName);
  }

  private extensionForMime(mime: string): string {
    switch (mime) {
      case 'image/jpeg':
        return '.jpg';
      case 'image/png':
        return '.png';
      case 'image/webp':
        return '.webp';
      default:
        return '';
    }
  }

  toDto(file: StoredFileEntity): StoredFileDto {
    return {
      id: file.id,
      originalName: file.originalName,
      title: file.title,
      alt: file.alt,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
      folderId: file.folderId as string | null,
      sortOrder: file.sortOrder as number,
      createdAt: file.createdAt.toISOString(),
    };
  }

  toFolderDto(folder: FileFolder): FileFolderDto {
    return {
      id: folder.id,
      name: folder.name,
      parentId: folder.parentId,
      createdAt: folder.createdAt.toISOString(),
    };
  }
}
