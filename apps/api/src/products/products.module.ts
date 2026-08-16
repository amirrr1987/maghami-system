import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductAttribute } from '../product-attributes/product-attribute.entity';
import { ProductBrandsModule } from '../product-brands/product-brands.module';
import { ProductCategoriesModule } from '../product-categories/product-categories.module';
import { ProductCodePattern } from '../product-code-patterns/product-code-pattern.entity';
import { ProductUnitsModule } from '../product-units/product-units.module';
import { ProductAttributeValue } from './product-attribute-value.entity';
import { Product } from './product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { SkuGeneratorService } from './sku-generator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductAttributeValue,
      ProductAttribute,
      ProductCodePattern,
    ]),
    ProductCategoriesModule,
    ProductBrandsModule,
    ProductUnitsModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService, SkuGeneratorService],
  exports: [ProductsService, SkuGeneratorService],
})
export class ProductsModule {}
