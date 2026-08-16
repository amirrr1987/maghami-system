import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type {
  PaginatedResult,
  PaginationQuery,
  ProductCodePattern as ProductCodePatternDto,
} from '@maghami-system/schemas';
import {
  paginationSkipTake,
  toPaginatedResult,
} from '@maghami-system/schemas';
import { QueryFailedError, Repository } from 'typeorm';
import { ProductCategoriesService } from '../product-categories/product-categories.service';
import { ProductCodePattern } from './product-code-pattern.entity';
import type {
  CreateProductCodePatternDto,
  UpdateProductCodePatternDto,
} from './product-code-pattern.schemas';

@Injectable()
export class ProductCodePatternsService {
  constructor(
    @InjectRepository(ProductCodePattern)
    private readonly patterns: Repository<ProductCodePattern>,
    private readonly categoriesService: ProductCategoriesService,
  ) {}

  async findAll(
    query: PaginationQuery,
  ): Promise<PaginatedResult<ProductCodePatternDto>> {
    const { skip, take } = paginationSkipTake(query);
    const [rows, total] = await this.patterns.findAndCount({
      order: { prefix: 'ASC' },
      skip,
      take,
    });
    return toPaginatedResult(
      rows.map((row) => this.toDto(row)),
      total,
      query,
    );
  }

  async findOne(id: string): Promise<ProductCodePatternDto> {
    return this.toDto(await this.findEntity(id));
  }

  async create(
    dto: CreateProductCodePatternDto,
  ): Promise<ProductCodePatternDto> {
    await this.categoriesService.findEntity(dto.categoryId);
    const entity = this.patterns.create({
      categoryId: dto.categoryId,
      prefix: dto.prefix.trim(),
      separator: dto.separator,
      length: dto.length,
      nextSequence: 1,
      isActive: dto.isActive ?? true,
    });
    try {
      return this.toDto(await this.patterns.save(entity));
    } catch (error) {
      this.rethrowUnique(
        error,
        'A code pattern already exists for this category',
      );
    }
  }

  async update(
    id: string,
    dto: UpdateProductCodePatternDto,
  ): Promise<ProductCodePatternDto> {
    const pattern = await this.findEntity(id);
    if (dto.categoryId !== undefined) {
      await this.categoriesService.findEntity(dto.categoryId);
      pattern.categoryId = dto.categoryId;
    }
    if (dto.prefix !== undefined) pattern.prefix = dto.prefix.trim();
    if (dto.separator !== undefined) pattern.separator = dto.separator;
    if (dto.length !== undefined) pattern.length = dto.length;
    if (dto.isActive !== undefined) pattern.isActive = dto.isActive;
    try {
      return this.toDto(await this.patterns.save(pattern));
    } catch (error) {
      this.rethrowUnique(
        error,
        'A code pattern already exists for this category',
      );
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.patterns.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Product code pattern ${id} not found`);
    }
  }

  private async findEntity(id: string): Promise<ProductCodePattern> {
    const pattern = await this.patterns.findOne({ where: { id } });
    if (!pattern) {
      throw new NotFoundException(`Product code pattern ${id} not found`);
    }
    return pattern;
  }

  private toDto(pattern: ProductCodePattern): ProductCodePatternDto {
    return {
      id: pattern.id,
      categoryId: pattern.categoryId,
      prefix: pattern.prefix,
      separator: pattern.separator,
      length: pattern.length,
      nextSequence: pattern.nextSequence,
      isActive: pattern.isActive,
      createdAt: pattern.createdAt as unknown as string,
      updatedAt: pattern.updatedAt as unknown as string,
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
