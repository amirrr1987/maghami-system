import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductUnit } from './product-unit.entity';
import { ProductUnitsController } from './product-units.controller';
import { ProductUnitsService } from './product-units.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductUnit])],
  controllers: [ProductUnitsController],
  providers: [ProductUnitsService],
  exports: [ProductUnitsService, TypeOrmModule],
})
export class ProductUnitsModule {}
