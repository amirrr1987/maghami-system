import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import {
  PermissionAction,
  PermissionResource,
} from '@maghami-system/schemas';
import { Role } from '../roles/role.entity';

@Entity({ name: 'permissions' })
@Unique('UQ_permissions_resource_action', ['resource', 'action'])
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** CASL subject from PermissionResource (varchar; Zod enforces enum). */
  @Column({ type: 'varchar', length: 64 })
  resource!: PermissionResource;

  /** CASL action from PermissionAction (varchar; Zod enforces enum). */
  @Column({ type: 'varchar', length: 64 })
  action!: PermissionAction;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles!: Role[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
