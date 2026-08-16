import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductBrand } from '../product-brands/product-brand.entity';
import { ProductCategory } from '../product-categories/product-category.entity';
import { ProductUnit } from '../product-units/product-unit.entity';
import { ProductAttributeValue } from './product-attribute-value.entity';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64, unique: true })
  sku!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'uuid', nullable: true, name: 'category_id' })
  categoryId!: string | null;

  @ManyToOne(() => ProductCategory, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category!: ProductCategory | null;

  @Column({ type: 'uuid', nullable: true, name: 'brand_id' })
  brandId!: string | null;

  @ManyToOne(() => ProductBrand, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'brand_id' })
  brand!: ProductBrand | null;

  @Column({ type: 'uuid', nullable: true, name: 'unit_id' })
  unitId!: string | null;

  @ManyToOne(() => ProductUnit, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'unit_id' })
  unit!: ProductUnit | null;

  /** Postgres UNIQUE allows multiple NULLs. */
  @Column({ type: 'varchar', length: 64, nullable: true, unique: true })
  barcode!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  /** Legacy — existing products UI; coding flows may leave default 0. */
  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  price!: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  @OneToMany(() => ProductAttributeValue, (row) => row.product, {
    cascade: true,
  })
  attributeValues!: ProductAttributeValue[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
