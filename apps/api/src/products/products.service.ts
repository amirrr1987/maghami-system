import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type {
  PaginatedResult,
  PaginationQuery,
  Product as ProductDto,
} from '@vue-nestjs-admin-template/schemas';
import {
  paginationSkipTake,
  toPaginatedResult,
} from '@vue-nestjs-admin-template/schemas';
import { QueryFailedError, Repository } from 'typeorm';
import { Product } from './product.entity';
import type { CreateProductDto, UpdateProductDto } from './product.schemas';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
  ) {}

  async findAll(
    query: PaginationQuery,
  ): Promise<PaginatedResult<ProductDto>> {
    const { skip, take } = paginationSkipTake(query);
    const [rows, total] = await this.products.findAndCount({
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

  async findOne(id: string): Promise<ProductDto> {
    return this.toDto(await this.findEntity(id));
  }

  async create(dto: CreateProductDto): Promise<ProductDto> {
    const entity = this.products.create({
      sku: dto.sku.trim(),
      name: dto.name.trim(),
      description: dto.description ?? null,
      price: dto.price.toFixed(2),
      isActive: dto.isActive ?? true,
    });
    try {
      return this.toDto(await this.products.save(entity));
    } catch (error) {
      this.rethrowUnique(error, 'Product SKU already exists');
    }
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductDto> {
    const product = await this.findEntity(id);
    if (dto.sku !== undefined) product.sku = dto.sku.trim();
    if (dto.name !== undefined) product.name = dto.name.trim();
    if (dto.description !== undefined) {
      product.description = dto.description ?? null;
    }
    if (dto.price !== undefined) product.price = dto.price.toFixed(2);
    if (dto.isActive !== undefined) product.isActive = dto.isActive;
    try {
      return this.toDto(await this.products.save(product));
    } catch (error) {
      this.rethrowUnique(error, 'Product SKU already exists');
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.products.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Product ${id} not found`);
    }
  }

  private async findEntity(id: string): Promise<Product> {
    const product = await this.products.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return product;
  }

  private toDto(product: Product): ProductDto {
    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      isActive: product.isActive,
      createdAt: product.createdAt as unknown as string,
      updatedAt: product.updatedAt as unknown as string,
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
