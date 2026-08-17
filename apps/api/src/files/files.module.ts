import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FileFolder } from './file-folder.entity';
import { StoredFile } from './stored-file.entity';
import { FILE_STORAGE } from './storage/file-storage';
import { LocalDiskStorage } from './storage/local-disk.storage';

@Module({
  imports: [
    TypeOrmModule.forFeature([StoredFile, FileFolder]),
    UsersModule,
  ],
  controllers: [FilesController],
  providers: [
    {
      provide: FILE_STORAGE,
      inject: [ConfigService],
      useFactory: (config: ConfigService): LocalDiskStorage =>
        new LocalDiskStorage(config),
    },
    FilesService,
  ],
  exports: [FilesService, TypeOrmModule],
})
export class FilesModule {}
