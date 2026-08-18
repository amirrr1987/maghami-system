import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesModule } from '../files/files.module';
import { ProductBrand } from './product-brand.entity';
import { ProductBrandsController } from './product-brands.controller';
import { ProductBrandsService } from './product-brands.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductBrand]), FilesModule],
  controllers: [ProductBrandsController],
  providers: [ProductBrandsService],
  exports: [ProductBrandsService, TypeOrmModule],
})
export class ProductBrandsModule {}
