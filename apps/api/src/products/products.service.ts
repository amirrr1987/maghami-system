import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type {
  PaginatedResult,
  Product as ProductDto,
  ProductAttributeValue as ProductAttributeValueDto,
  ProductAttributeValueInputDto,
  ProductListQuery,
} from '@maghami-system/schemas';
import {
  paginationSkipTake,
  toPaginatedResult,
} from '@maghami-system/schemas';
import { In, QueryFailedError, Repository } from 'typeorm';
import { ProductAttribute } from '../product-attributes/product-attribute.entity';
import { ProductBrandsService } from '../product-brands/product-brands.service';
import { ProductCategoriesService } from '../product-categories/product-categories.service';
import { ProductUnitsService } from '../product-units/product-units.service';
import { ProductAttributeValue } from './product-attribute-value.entity';
import { Product } from './product.entity';
import type { CreateProductDto, UpdateProductDto } from './product.schemas';
import { SkuGeneratorService } from './sku-generator.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
    @InjectRepository(ProductAttributeValue)
    private readonly attributeValues: Repository<ProductAttributeValue>,
    @InjectRepository(ProductAttribute)
    private readonly attributes: Repository<ProductAttribute>,
    private readonly categoriesService: ProductCategoriesService,
    private readonly brandsService: ProductBrandsService,
    private readonly unitsService: ProductUnitsService,
    private readonly skuGenerator: SkuGeneratorService,
  ) {}

  async findAll(
    query: ProductListQuery,
  ): Promise<PaginatedResult<ProductDto>> {
    const { skip, take } = paginationSkipTake(query);
    const qb = this.products
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.attributeValues', 'attributeValues')
      .leftJoinAndSelect('attributeValues.attribute', 'attribute')
      .orderBy('product.name', 'ASC')
      .skip(skip)
      .take(take);

    if (query.q) {
      qb.andWhere(
        '(product.name ILIKE :q OR product.sku ILIKE :q OR product.barcode ILIKE :q)',
        { q: `%${query.q}%` },
      );
    }
    if (query.categoryId) {
      qb.andWhere('product.categoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }
    if (query.brandId) {
      qb.andWhere('product.brandId = :brandId', { brandId: query.brandId });
    }
    if (query.isActive !== undefined) {
      qb.andWhere('product.isActive = :isActive', {
        isActive: query.isActive,
      });
    }

    const [rows, total] = await qb.getManyAndCount();
    return toPaginatedResult(
      rows.map((row) => this.toDto(row)),
      total,
      query,
    );
  }

  async findOne(id: string): Promise<ProductDto> {
    return this.toDto(await this.findEntity(id));
  }

  async previewSku(categoryId: string): Promise<{ sku: string }> {
    await this.categoriesService.findEntity(categoryId);
    return { sku: await this.skuGenerator.previewForCategory(categoryId) };
  }

  async create(dto: CreateProductDto): Promise<ProductDto> {
    await this.categoriesService.findEntity(dto.categoryId);
    if (dto.brandId) await this.brandsService.findEntity(dto.brandId);
    if (dto.unitId) await this.unitsService.findEntity(dto.unitId);

    const sku =
      dto.sku?.trim() ||
      (await this.skuGenerator.generateForCategory(dto.categoryId));

    const entity = this.products.create({
      sku,
      name: dto.name.trim(),
      categoryId: dto.categoryId,
      brandId: dto.brandId ?? null,
      unitId: dto.unitId ?? null,
      barcode: dto.barcode ?? null,
      description: dto.description ?? null,
      price: (dto.price ?? 0).toFixed(2),
      isActive: dto.isActive ?? true,
    });

    try {
      const saved = await this.products.save(entity);
      if (dto.attributeValues?.length) {
        await this.replaceAttributeValues(saved.id, dto.attributeValues);
      }
      return this.toDto(await this.findEntity(saved.id));
    } catch (error) {
      this.rethrowUnique(error);
    }
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductDto> {
    const product = await this.findEntity(id);

    if (dto.categoryId !== undefined) {
      await this.categoriesService.findEntity(dto.categoryId);
      product.categoryId = dto.categoryId;
    }
    if (dto.brandId !== undefined) {
      if (dto.brandId) await this.brandsService.findEntity(dto.brandId);
      product.brandId = dto.brandId;
    }
    if (dto.unitId !== undefined) {
      if (dto.unitId) await this.unitsService.findEntity(dto.unitId);
      product.unitId = dto.unitId;
    }
    if (dto.sku !== undefined) product.sku = dto.sku.trim();
    if (dto.name !== undefined) product.name = dto.name.trim();
    if (dto.barcode !== undefined) product.barcode = dto.barcode ?? null;
    if (dto.description !== undefined) {
      product.description = dto.description ?? null;
    }
    if (dto.price !== undefined) product.price = dto.price.toFixed(2);
    if (dto.isActive !== undefined) product.isActive = dto.isActive;

    try {
      await this.products.save(product);
      if (dto.attributeValues !== undefined) {
        await this.replaceAttributeValues(id, dto.attributeValues);
      }
      return this.toDto(await this.findEntity(id));
    } catch (error) {
      this.rethrowUnique(error);
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.products.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Product ${id} not found`);
    }
  }

  private async replaceAttributeValues(
    productId: string,
    values: ProductAttributeValueInputDto[],
  ): Promise<void> {
    const attributeIds = [...new Set(values.map((row) => row.attributeId))];
    const attributes =
      attributeIds.length === 0
        ? []
        : await this.attributes.find({ where: { id: In(attributeIds) } });
    const byId = new Map(attributes.map((row) => [row.id, row]));

    for (const row of values) {
      const attribute = byId.get(row.attributeId);
      if (!attribute) {
        throw new NotFoundException(
          `Product attribute ${row.attributeId} not found`,
        );
      }
      this.assertAttributeValue(attribute, row.value);
    }

    await this.attributeValues.delete({ productId });
    if (values.length === 0) return;

    const entities = values.map((row) =>
      this.attributeValues.create({
        productId,
        attributeId: row.attributeId,
        value: row.value.trim(),
      }),
    );
    await this.attributeValues.save(entities);
  }

  private assertAttributeValue(
    attribute: ProductAttribute,
    raw: string,
  ): void {
    const value = raw.trim();
    switch (attribute.type) {
      case 'TEXT':
        if (!value) {
          throw new BadRequestException(
            `Attribute ${attribute.code} requires a non-empty text value`,
          );
        }
        return;
      case 'NUMBER':
        if (!Number.isFinite(Number(value))) {
          throw new BadRequestException(
            `Attribute ${attribute.code} requires a numeric value`,
          );
        }
        return;
      case 'BOOLEAN':
        if (value !== 'true' && value !== 'false') {
          throw new BadRequestException(
            `Attribute ${attribute.code} requires "true" or "false"`,
          );
        }
        return;
      case 'SELECT': {
        const options = attribute.options ?? [];
        if (!options.includes(value)) {
          throw new BadRequestException(
            `Attribute ${attribute.code} value must be one of: ${options.join(', ')}`,
          );
        }
        return;
      }
      default:
        throw new BadRequestException(
          `Unsupported attribute type for ${attribute.code}`,
        );
    }
  }

  private async findEntity(id: string): Promise<Product> {
    const product = await this.products.findOne({
      where: { id },
      relations: {
        attributeValues: { attribute: true },
      },
    });
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return product;
  }

  private toDto(product: Product): ProductDto {
    const attributeValues: ProductAttributeValueDto[] = (
      product.attributeValues ?? []
    ).map((row) => ({
      id: row.id,
      productId: row.productId,
      attributeId: row.attributeId,
      value: row.value,
      attribute: row.attribute
        ? {
            id: row.attribute.id,
            name: row.attribute.name,
            code: row.attribute.code,
            type: row.attribute.type,
            options: row.attribute.options,
          }
        : undefined,
    }));

    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      categoryId: product.categoryId,
      brandId: product.brandId,
      unitId: product.unitId,
      barcode: product.barcode,
      description: product.description,
      price: Number(product.price),
      isActive: product.isActive,
      attributeValues,
      createdAt: product.createdAt as unknown as string,
      updatedAt: product.updatedAt as unknown as string,
    };
  }

  private rethrowUnique(error: unknown): never {
    if (
      error instanceof QueryFailedError &&
      typeof error.driverError === 'object' &&
      error.driverError !== null &&
      'code' in error.driverError &&
      error.driverError.code === '23505'
    ) {
      const detail =
        'detail' in error.driverError &&
        typeof error.driverError.detail === 'string'
          ? error.driverError.detail
          : '';
      if (detail.includes('barcode')) {
        throw new ConflictException('Product barcode already exists');
      }
      throw new ConflictException('Product SKU already exists');
    }
    throw error;
  }
}
