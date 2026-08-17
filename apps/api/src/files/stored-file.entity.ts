import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'files' })
export class StoredFile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, name: 'original_name' })
  originalName!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  title!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  alt!: string;

  /** Filename on disk (uuid + extension). Flat — not a folder path. */
  @Column({ type: 'varchar', length: 255, name: 'stored_name', unique: true })
  storedName!: string;

  @Column({ type: 'varchar', length: 128, name: 'mime_type' })
  mimeType!: string;

  @Column({ type: 'int', name: 'size_bytes' })
  sizeBytes!: number;

  @Index()
  @Column({ type: 'uuid', name: 'owner_user_id' })
  ownerUserId!: string;

  /** Logical folder (null = root). Does not change the on-disk file name. */
  @Index()
  @Column({ type: 'uuid', name: 'folder_id', nullable: true })
  folderId!: string | null;

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder!: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}
