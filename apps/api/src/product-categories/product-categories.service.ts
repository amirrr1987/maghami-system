import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type {
  PaginatedResult,
  PaginationQuery,
  ProductCategory as ProductCategoryDto,
  ProductCategoryTreeNode,
} from '@vue-nestjs-admin-template/schemas';
import {
  paginationSkipTake,
  toPaginatedResult,
} from '@vue-nestjs-admin-template/schemas';
import { QueryFailedError, Repository } from 'typeorm';
import { ProductCategory } from './product-category.entity';
import type {
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
} from './product-category.schemas';

@Injectable()
export class ProductCategoriesService {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly categories: Repository<ProductCategory>,
  ) {}

  async findAll(
    query: PaginationQuery,
  ): Promise<PaginatedResult<ProductCategoryDto>> {
    const { skip, take } = paginationSkipTake(query);
    const [rows, total] = await this.categories.findAndCount({
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

  async findTree(): Promise<ProductCategoryTreeNode[]> {
    const rows = await this.categories.find({ order: { name: 'ASC' } });
    return this.buildTree(rows.map((row) => this.toDto(row)));
  }

  async findOne(id: string): Promise<ProductCategoryDto> {
    return this.toDto(await this.findEntity(id));
  }

  async create(dto: CreateProductCategoryDto): Promise<ProductCategoryDto> {
    if (dto.parentId) {
      await this.findEntity(dto.parentId);
    }
    const entity = this.categories.create({
      name: dto.name.trim(),
      code: dto.code.trim(),
      description: dto.description ?? null,
      parentId: dto.parentId ?? null,
      isActive: dto.isActive ?? true,
    });
    try {
      return this.toDto(await this.categories.save(entity));
    } catch (error) {
      this.rethrowUnique(error, 'Product category code already exists');
    }
  }

  async update(
    id: string,
    dto: UpdateProductCategoryDto,
  ): Promise<ProductCategoryDto> {
    const category = await this.findEntity(id);
    if (dto.parentId !== undefined) {
      if (dto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }
      if (dto.parentId) {
        await this.findEntity(dto.parentId);
        await this.assertNotDescendant(id, dto.parentId);
      }
      category.parentId = dto.parentId;
    }
    if (dto.name !== undefined) category.name = dto.name.trim();
    if (dto.code !== undefined) category.code = dto.code.trim();
    if (dto.description !== undefined) {
      category.description = dto.description ?? null;
    }
    if (dto.isActive !== undefined) category.isActive = dto.isActive;
    try {
      return this.toDto(await this.categories.save(category));
    } catch (error) {
      this.rethrowUnique(error, 'Product category code already exists');
    }
  }

  async remove(id: string): Promise<void> {
    const childCount = await this.categories.count({ where: { parentId: id } });
    if (childCount > 0) {
      throw new BadRequestException(
        'Cannot delete a category that still has children',
      );
    }
    const result = await this.categories.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Product category ${id} not found`);
    }
  }

  async findEntity(id: string): Promise<ProductCategory> {
    const category = await this.categories.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Product category ${id} not found`);
    }
    return category;
  }

  private async assertNotDescendant(
    ancestorId: string,
    candidateParentId: string,
  ): Promise<void> {
    let currentId: string | null = candidateParentId;
    const visited = new Set<string>();
    while (currentId) {
      if (currentId === ancestorId) {
        throw new BadRequestException(
          'Cannot move a category under one of its descendants',
        );
      }
      if (visited.has(currentId)) break;
      visited.add(currentId);
      const row: ProductCategory | null = await this.categories.findOne({
        where: { id: currentId },
      });
      currentId = row?.parentId ?? null;
    }
  }

  private buildTree(
    flat: ProductCategoryDto[],
  ): ProductCategoryTreeNode[] {
    const byId = new Map<string, ProductCategoryTreeNode>();
    for (const row of flat) {
      byId.set(row.id, { ...row, children: [] });
    }
    const roots: ProductCategoryTreeNode[] = [];
    for (const node of byId.values()) {
      if (node.parentId && byId.has(node.parentId)) {
        byId.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }

  private toDto(category: ProductCategory): ProductCategoryDto {
    return {
      id: category.id,
      name: category.name,
      code: category.code,
      description: category.description,
      parentId: category.parentId,
      isActive: category.isActive,
      createdAt: category.createdAt as unknown as string,
      updatedAt: category.updatedAt as unknown as string,
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
