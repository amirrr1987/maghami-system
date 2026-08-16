import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductBrand } from './product-brand.entity';
import { ProductBrandsController } from './product-brands.controller';
import { ProductBrandsService } from './product-brands.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductBrand])],
  controllers: [ProductBrandsController],
  providers: [ProductBrandsService],
  exports: [ProductBrandsService, TypeOrmModule],
})
export class ProductBrandsModule {}
