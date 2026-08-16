import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type {
  PaginatedResult,
  PaginationQuery,
  Permission as PermissionDto,
  PermissionAction,
  PermissionResource,
} from '@vue-nestjs-admin-template/schemas';
import { paginationSkipTake, toPaginatedResult } from '@vue-nestjs-admin-template/schemas';
import { In, QueryFailedError, Repository } from 'typeorm';
import { Permission } from './permission.entity';
import type {
  CreatePermissionDto,
  UpdatePermissionDto,
} from './permission.schemas';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissions: Repository<Permission>,
  ) {}

  async findAll(
    query: PaginationQuery,
  ): Promise<PaginatedResult<PermissionDto>> {
    const { skip, take } = paginationSkipTake(query);
    const [items, total] = await this.permissions.findAndCount({
      order: { resource: 'ASC', action: 'ASC' },
      skip,
      take,
    });
    return toPaginatedResult(
      items.map((item) => this.toDto(item)),
      total,
      query,
    );
  }

  async findOne(id: string): Promise<PermissionDto> {
    return this.toDto(await this.findEntity(id));
  }

  async create(dto: CreatePermissionDto): Promise<PermissionDto> {
    const entity = this.permissions.create({
      resource: dto.resource,
      action: dto.action,
      name: dto.name,
      description: dto.description ?? null,
    });
    try {
      return this.toDto(await this.permissions.save(entity));
    } catch (error) {
      this.rethrowUnique(error, 'Permission already exists');
    }
  }

  async update(
    id: string,
    dto: UpdatePermissionDto,
  ): Promise<PermissionDto> {
    const permission = await this.findEntity(id);
    if (dto.resource !== undefined) permission.resource = dto.resource;
    if (dto.action !== undefined) permission.action = dto.action;
    if (dto.name !== undefined) permission.name = dto.name;
    if (dto.description !== undefined) {
      permission.description = dto.description ?? null;
    }
    try {
      return this.toDto(await this.permissions.save(permission));
    } catch (error) {
      this.rethrowUnique(error, 'Permission already exists');
    }
  }

  async remove(id: string): Promise<void> {
    const permission = await this.findEntity(id);
    await this.permissions.manager
      .createQueryBuilder()
      .delete()
      .from('role_permissions')
      .where('permission_id = :id', { id: permission.id })
      .execute();
    await this.permissions.delete(permission.id);
  }

  async findByIds(ids: string[]): Promise<Permission[]> {
    if (ids.length === 0) return [];
    const found = await this.permissions.find({ where: { id: In(ids) } });
    if (found.length !== ids.length) {
      const foundIds = new Set(found.map((p) => p.id));
      const missing = ids.filter((id) => !foundIds.has(id));
      throw new NotFoundException(
        `Permissions not found: ${missing.join(', ')}`,
      );
    }
    return found;
  }

  async findAllEntities(): Promise<Permission[]> {
    return this.permissions.find();
  }

  /** Entity for bootstrap / internal wiring (not API DTO). */
  async ensure(
    resource: PermissionResource,
    action: PermissionAction,
    name: string,
    description?: string | null,
  ): Promise<Permission> {
    const existing = await this.permissions.findOne({
      where: { resource, action },
    });
    if (existing) {
      return existing;
    }
    try {
      return await this.permissions.save(
        this.permissions.create({
          resource,
          action,
          name,
          description: description ?? null,
        }),
      );
    } catch (error) {
      this.rethrowUnique(error, 'Permission already exists');
    }
  }

  private async findEntity(id: string): Promise<Permission> {
    const permission = await this.permissions.findOne({ where: { id } });
    if (!permission) {
      throw new NotFoundException(`Permission ${id} not found`);
    }
    return permission;
  }

  private toDto(permission: Permission): PermissionDto {
    return {
      id: permission.id,
      resource: permission.resource,
      action: permission.action,
      name: permission.name,
      description: permission.description,
      createdAt: permission.createdAt as unknown as string,
      updatedAt: permission.updatedAt as unknown as string,
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
