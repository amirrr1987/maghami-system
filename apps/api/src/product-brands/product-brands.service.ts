import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type {
  PaginatedResult,
  PaginationQuery,
  ProductBrand as ProductBrandDto,
} from '@maghami-system/schemas';
import {
  paginationSkipTake,
  toPaginatedResult,
} from '@maghami-system/schemas';
import { QueryFailedError, Repository } from 'typeorm';
import { ProductBrand } from './product-brand.entity';
import type {
  CreateProductBrandDto,
  UpdateProductBrandDto,
} from './product-brand.schemas';

@Injectable()
export class ProductBrandsService {
  constructor(
    @InjectRepository(ProductBrand)
    private readonly brands: Repository<ProductBrand>,
  ) {}

  async findAll(
    query: PaginationQuery,
  ): Promise<PaginatedResult<ProductBrandDto>> {
    const { skip, take } = paginationSkipTake(query);
    const [rows, total] = await this.brands.findAndCount({
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

  async findOne(id: string): Promise<ProductBrandDto> {
    return this.toDto(await this.findEntity(id));
  }

  async create(dto: CreateProductBrandDto): Promise<ProductBrandDto> {
    const entity = this.brands.create({
      name: dto.name.trim(),
      code: dto.code.trim(),
      logoUrl: dto.logoUrl ?? null,
      description: dto.description ?? null,
      isActive: dto.isActive ?? true,
    });
    try {
      return this.toDto(await this.brands.save(entity));
    } catch (error) {
      this.rethrowUnique(error, 'Product brand code already exists');
    }
  }

  async update(
    id: string,
    dto: UpdateProductBrandDto,
  ): Promise<ProductBrandDto> {
    const brand = await this.findEntity(id);
    if (dto.name !== undefined) brand.name = dto.name.trim();
    if (dto.code !== undefined) brand.code = dto.code.trim();
    if (dto.logoUrl !== undefined) brand.logoUrl = dto.logoUrl ?? null;
    if (dto.description !== undefined) {
      brand.description = dto.description ?? null;
    }
    if (dto.isActive !== undefined) brand.isActive = dto.isActive;
    try {
      return this.toDto(await this.brands.save(brand));
    } catch (error) {
      this.rethrowUnique(error, 'Product brand code already exists');
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.brands.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Product brand ${id} not found`);
    }
  }

  async findEntity(id: string): Promise<ProductBrand> {
    const brand = await this.brands.findOne({ where: { id } });
    if (!brand) {
      throw new NotFoundException(`Product brand ${id} not found`);
    }
    return brand;
  }

  private toDto(brand: ProductBrand): ProductBrandDto {
    return {
      id: brand.id,
      name: brand.name,
      code: brand.code,
      logoUrl: brand.logoUrl,
      description: brand.description,
      isActive: brand.isActive,
      createdAt: brand.createdAt as unknown as string,
      updatedAt: brand.updatedAt as unknown as string,
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
