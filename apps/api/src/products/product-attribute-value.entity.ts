import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ProductAttribute } from '../product-attributes/product-attribute.entity';
import { Product } from './product.entity';

@Entity({ name: 'product_attribute_values' })
@Unique(['productId', 'attributeId'])
export class ProductAttributeValue {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'product_id' })
  productId!: string;

  @ManyToOne(() => Product, (product) => product.attributeValues, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ type: 'uuid', name: 'attribute_id' })
  attributeId!: string;

  @ManyToOne(() => ProductAttribute, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attribute_id' })
  attribute!: ProductAttribute;

  /** Canonical string form (NUMBER/BOOLEAN/SELECT serialized). */
  @Column({ type: 'text' })
  value!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
