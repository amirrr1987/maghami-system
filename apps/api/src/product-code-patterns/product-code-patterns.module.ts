import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCategoriesModule } from '../product-categories/product-categories.module';
import { ProductCodePattern } from './product-code-pattern.entity';
import { ProductCodePatternsController } from './product-code-patterns.controller';
import { ProductCodePatternsService } from './product-code-patterns.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductCodePattern]),
    ProductCategoriesModule,
  ],
  controllers: [ProductCodePatternsController],
  providers: [ProductCodePatternsService],
  exports: [ProductCodePatternsService, TypeOrmModule],
})
export class ProductCodePatternsModule {}
