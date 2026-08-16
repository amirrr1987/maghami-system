import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductCategory } from '../product-categories/product-category.entity';

@Entity({ name: 'product_code_patterns' })
@Index(['categoryId'], { unique: true })
export class ProductCodePattern {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'category_id' })
  categoryId!: string;

  @ManyToOne(() => ProductCategory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category!: ProductCategory;

  @Column({ type: 'varchar', length: 32 })
  prefix!: string;

  @Column({ type: 'varchar', length: 8, default: '-' })
  separator!: string;

  /** Zero-padded numeric segment length (e.g. 6 → 000001). */
  @Column({ type: 'int' })
  length!: number;

  /** Next sequence value to allocate (monotonic per pattern). */
  @Column({ type: 'int', default: 1, name: 'next_sequence' })
  nextSequence!: number;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
