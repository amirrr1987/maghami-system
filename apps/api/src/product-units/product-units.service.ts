import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type {
  PaginatedResult,
  PaginationQuery,
  ProductUnit as ProductUnitDto,
} from '@maghami-system/schemas';
import { paginationSkipTake, toPaginatedResult } from '@maghami-system/schemas';
import { QueryFailedError, Repository } from 'typeorm';
import { ProductUnit } from './product-unit.entity';
import type {
  CreateProductUnitDto,
  UpdateProductUnitDto,
} from './product-unit.schemas';

@Injectable()
export class ProductUnitsService {
  constructor(
    @InjectRepository(ProductUnit)
    private readonly units: Repository<ProductUnit>,
  ) {}

  async findAll(
    query: PaginationQuery,
  ): Promise<PaginatedResult<ProductUnitDto>> {
    const { skip, take } = paginationSkipTake(query);
    const [rows, total] = await this.units.findAndCount({
      order: { name: 'ASC' },
      skip,
      take,
    });
    return toPaginatedResult(
      rows.map((row) => this.toDto(row)),
      total,
      query,
    );
  }

  async findOne(id: string): Promise<ProductUnitDto> {
    return this.toDto(await this.findEntity(id));
  }

  async create(dto: CreateProductUnitDto): Promise<ProductUnitDto> {
    const entity = this.units.create({
      name: dto.name.trim(),
      code: dto.code.trim(),
      symbol: dto.symbol.trim(),
      isActive: dto.isActive ?? true,
    });
    try {
      return this.toDto(await this.units.save(entity));
    } catch (error) {
      this.rethrowUnique(error, 'Product unit code already exists');
    }
  }

  async update(id: string, dto: UpdateProductUnitDto): Promise<ProductUnitDto> {
    const unit = await this.findEntity(id);
    if (dto.name !== undefined) unit.name = dto.name.trim();
    if (dto.code !== undefined) unit.code = dto.code.trim();
    if (dto.symbol !== undefined) unit.symbol = dto.symbol.trim();
    if (dto.isActive !== undefined) unit.isActive = dto.isActive;
    try {
      return this.toDto(await this.units.save(unit));
    } catch (error) {
      this.rethrowUnique(error, 'Product unit code already exists');
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.units.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Product unit ${id} not found`);
    }
  }

  async findEntity(id: string): Promise<ProductUnit> {
    const unit = await this.units.findOne({ where: { id } });
    if (!unit) {
      throw new NotFoundException(`Product unit ${id} not found`);
    }
    return unit;
  }

  private toDto(unit: ProductUnit): ProductUnitDto {
    return {
      id: unit.id,
      name: unit.name,
      code: unit.code,
      symbol: unit.symbol,
      isActive: unit.isActive,
      createdAt: unit.createdAt as unknown as string,
      updatedAt: unit.updatedAt as unknown as string,
    };
  }

  private rethrowUnique(error: unknown, message: string): never {
    if (
      error instanceof QueryFailedError &&
      typeof error.driverError === 'object' &&
      error.driverError !== null &&
      'code' in error.driverError &&
      error.driverError.code === '23505'
    ) {
      throw new ConflictException(message);
    }
    throw error;
  }
}
