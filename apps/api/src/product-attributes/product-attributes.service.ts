import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type {
  PaginatedResult,
  PaginationQuery,
  ProductAttribute as ProductAttributeDto,
} from '@maghami-system/schemas';
import { paginationSkipTake, toPaginatedResult } from '@maghami-system/schemas';
import { QueryFailedError, Repository } from 'typeorm';
import { ProductAttribute } from './product-attribute.entity';
import type {
  CreateProductAttributeDto,
  UpdateProductAttributeDto,
} from './product-attribute.schemas';

@Injectable()
export class ProductAttributesService {
  constructor(
    @InjectRepository(ProductAttribute)
    private readonly attributes: Repository<ProductAttribute>,
  ) {}

  async findAll(
    query: PaginationQuery,
  ): Promise<PaginatedResult<ProductAttributeDto>> {
    const { skip, take } = paginationSkipTake(query);
    const [rows, total] = await this.attributes.findAndCount({
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

  async findOne(id: string): Promise<ProductAttributeDto> {
    return this.toDto(await this.findEntity(id));
  }

  async create(dto: CreateProductAttributeDto): Promise<ProductAttributeDto> {
    const entity = this.attributes.create({
      name: dto.name.trim(),
      code: dto.code.trim(),
      type: dto.type,
      options: dto.type === 'SELECT' ? (dto.options ?? []) : null,
      isActive: dto.isActive ?? true,
    });
    try {
      return this.toDto(await this.attributes.save(entity));
    } catch (error) {
      this.rethrowUnique(error, 'Product attribute code already exists');
    }
  }

  async update(
    id: string,
    dto: UpdateProductAttributeDto,
  ): Promise<ProductAttributeDto> {
    const attribute = await this.findEntity(id);
    if (dto.name !== undefined) attribute.name = dto.name.trim();
    if (dto.code !== undefined) attribute.code = dto.code.trim();
    if (dto.type !== undefined) attribute.type = dto.type;
    const nextType = dto.type ?? attribute.type;
    if (dto.options !== undefined || dto.type !== undefined) {
      attribute.options =
        nextType === 'SELECT' ? (dto.options ?? attribute.options ?? []) : null;
    }
    if (dto.isActive !== undefined) attribute.isActive = dto.isActive;
    try {
      return this.toDto(await this.attributes.save(attribute));
    } catch (error) {
      this.rethrowUnique(error, 'Product attribute code already exists');
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.attributes.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Product attribute ${id} not found`);
    }
  }

  async findEntity(id: string): Promise<ProductAttribute> {
    const attribute = await this.attributes.findOne({ where: { id } });
    if (!attribute) {
      throw new NotFoundException(`Product attribute ${id} not found`);
    }
    return attribute;
  }

  private toDto(attribute: ProductAttribute): ProductAttributeDto {
    return {
      id: attribute.id,
      name: attribute.name,
      code: attribute.code,
      type: attribute.type,
      options: attribute.options,
      isActive: attribute.isActive,
      createdAt: attribute.createdAt as unknown as string,
      updatedAt: attribute.updatedAt as unknown as string,
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
