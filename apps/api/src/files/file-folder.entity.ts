import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

/** Nested folder row — organization is DB-only; disk names stay flat UUIDs. */
@Entity({ name: 'file_folders' })
export class FileFolder {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 128 })
  name!: string;

  /** null = top-level under library root */
  @Index()
  @Column({ type: 'uuid', name: 'parent_id', nullable: true })
  parentId!: string | null;

  @Index()
  @Column({ type: 'uuid', name: 'owner_user_id' })
  ownerUserId!: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}
