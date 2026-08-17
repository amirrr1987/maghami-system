import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PermissionAction } from '@maghami-system/schemas';
import type { Response } from 'express';
import { RequireAbility } from '../auth/decorators/require-ability.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RawResponse } from '../common/decorators/raw-response.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { User } from '../users/user.entity';
import { FilesService } from './files.service';
import {
  bulkDeleteFilesSchema,
  createFileFolderSchema,
  filesListQuerySchema,
  moveFileSchema,
  reorderFilesSchema,
  updateFileFolderSchema,
  updateFileMetaSchema,
  uploadFileMetaSchema,
} from './files.schemas';
import type {
  BulkDeleteFilesDto,
  CreateFileFolderDto,
  FilesListQuery,
  MoveFileDto,
  ReorderFilesDto,
  UpdateFileFolderDto,
  UpdateFileMetaDto,
  UploadFileMetaDto,
} from './files.types';
import { ApiResultStoredFileResponse } from './files.swagger';
import { IMAGE_UPLOAD_MAX_BYTES } from './image-upload-limits';
import type { UploadedImageFile } from './uploaded-image-file';

const imageUploadOptions: MulterOptions = {
  limits: { fileSize: IMAGE_UPLOAD_MAX_BYTES },
};

@ApiTags('files')
@ApiBearerAuth()
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('storage')
  @RequireAbility(PermissionAction.Read, 'files')
  @ApiOperation({
    summary: 'Active storage pipeline (Multer → local disk)',
  })
  @ApiOkResponse({ description: 'Storage info' })
  storage() {
    return this.filesService.getStorageInfo();
  }

  @Get('stats')
  @RequireAbility(PermissionAction.Read, 'files')
  @ApiOperation({ summary: 'Library totals (count, size, folders)' })
  @ApiOkResponse({ description: 'File stats' })
  stats() {
    return this.filesService.getStats();
  }

  @Get('folders')
  @RequireAbility(PermissionAction.Read, 'files')
  @ApiOperation({ summary: 'List file folders (flat list with parentId)' })
  @ApiOkResponse({ description: 'Folders' })
  listFolders() {
    return this.filesService.listFolders();
  }

  @Post('folders')
  @RequireAbility(PermissionAction.Create, 'files')
  @ApiOperation({ summary: 'Create a folder' })
  @ApiOkResponse({ description: 'Created folder' })
  createFolder(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(createFileFolderSchema))
    dto: CreateFileFolderDto,
  ) {
    return this.filesService.createFolder(user, dto);
  }

  @Patch('folders/:id')
  @RequireAbility(PermissionAction.Update, 'files')
  @ApiOperation({ summary: 'Rename a folder' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  updateFolder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateFileFolderSchema))
    dto: UpdateFileFolderDto,
  ) {
    return this.filesService.updateFolder(id, dto);
  }

  @Delete('folders/:id')
  @RequireAbility(PermissionAction.Delete, 'files')
  @ApiOperation({ summary: 'Delete an empty folder' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  async deleteFolder(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.filesService.deleteFolder(id);
  }

  @Put('reorder')
  @RequireAbility(PermissionAction.Update, 'files')
  @ApiOperation({ summary: 'Reorder files inside a folder (or root)' })
  async reorder(
    @Body(new ZodValidationPipe(reorderFilesSchema)) dto: ReorderFilesDto,
  ): Promise<void> {
    await this.filesService.reorderFiles(dto);
  }

  @Post('bulk-delete')
  @RequireAbility(PermissionAction.Delete, 'files')
  @ApiOperation({ summary: 'Delete multiple files' })
  bulkDelete(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(bulkDeleteFilesSchema)) dto: BulkDeleteFilesDto,
  ) {
    return this.filesService.bulkRemove(user, dto);
  }

  @Get()
  @RequireAbility(PermissionAction.Read, 'files')
  @ApiOperation({ summary: 'List stored files (paginated for antdv Table)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiQuery({ name: 'folderId', required: false, type: String })
  @ApiOkResponse({ description: 'Paginated stored files' })
  findAll(
    @Query(new ZodValidationPipe(filesListQuerySchema))
    query: FilesListQuery,
  ) {
    return this.filesService.findPage(query);
  }

  @Post()
  @RequireAbility(PermissionAction.Create, 'files')
  @ApiOperation({ summary: 'Upload an image (jpeg/png/webp) via Multer' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'title'],
      properties: {
        file: { type: 'string', format: 'binary' },
        folderId: { type: 'string', format: 'uuid', nullable: true },
        title: { type: 'string', maxLength: 255 },
        alt: { type: 'string', maxLength: 255 },
      },
    },
  })
  @ApiOkResponse({ type: ApiResultStoredFileResponse })
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  upload(
    @CurrentUser() user: User,
    @UploadedFile() file: UploadedImageFile,
    @Body('folderId') folderIdRaw?: string,
    @Body('title') titleRaw?: string,
    @Body('alt') altRaw?: string,
  ) {
    const folderId =
      !folderIdRaw || folderIdRaw === 'root' || folderIdRaw.trim() === ''
        ? null
        : folderIdRaw.trim();
    const meta: UploadFileMetaDto = uploadFileMetaSchema.parse({
      title: titleRaw,
      alt: altRaw ?? '',
    });
    return this.filesService.saveUpload(user, file, folderId, meta);
  }

  @Patch(':id/location')
  @RequireAbility(PermissionAction.Update, 'files')
  @ApiOperation({ summary: 'Move file to another folder (or root)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ type: ApiResultStoredFileResponse })
  move(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(moveFileSchema)) dto: MoveFileDto,
  ) {
    return this.filesService.moveFile(id, dto);
  }

  @Patch(':id/meta')
  @RequireAbility(PermissionAction.Update, 'files')
  @ApiOperation({ summary: 'Update file title and alt' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ type: ApiResultStoredFileResponse })
  updateMeta(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateFileMetaSchema)) dto: UpdateFileMetaDto,
  ) {
    return this.filesService.updateMeta(id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file metadata (owner or files:read)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ type: ApiResultStoredFileResponse })
  findOne(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.filesService.findOneForActor(user, id);
  }

  @Get(':id/content')
  @RawResponse()
  @ApiOperation({
    summary: 'Stream file bytes (auth required; owner or files:read)',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  async content(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Res() response: Response,
  ): Promise<void> {
    await this.filesService.streamContent(user, id, response);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete file (owner or files:delete)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ description: 'Deleted' })
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.filesService.remove(user, id);
  }
}
