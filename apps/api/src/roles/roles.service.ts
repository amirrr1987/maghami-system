import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type {
  PaginatedResult,
  PaginationQuery,
  PermissionRef,
  Role as RoleDto,
  RoleRef,
} from '@vue-nestjs-admin-template/schemas';
import {
  isSuperAdminRoleValue,
  paginationSkipTake,
  PermissionAction,
  SUPER_ADMIN_ROLE_VALUE,
  toPaginatedResult,
} from '@vue-nestjs-admin-template/schemas';
import { In, QueryFailedError, Repository } from 'typeorm';
import type { Permission } from '../permissions/permission.entity';
import { PermissionsService } from '../permissions/permissions.service';
import { Role } from './role.entity';
import type {
  CreateRoleDto,
  SetRolePermissionsDto,
  UpdateRoleDto,
} from './role.schemas';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roles: Repository<Role>,
    private readonly permissionsService: PermissionsService,
  ) { }

  /** Copy legacy `name` into empty `label` after schema sync. */
  async backfillEmptyLabels(): Promise<void> {
    await this.roles.query(`
      UPDATE roles
      SET label = name
      WHERE (label IS NULL OR btrim(label) = '')
        AND name IS NOT NULL
    `);
  }

  /**
   * `write` is not an alias of create/update. Copy legacy write grants onto
   * the matching create/update catalog rows so existing roles keep working.
   */
  async copyWriteGrantsToCreateUpdate(): Promise<void> {
    const catalog = await this.permissionsService.findAllEntities();
    const byKey = new Map(
      catalog.map((item) => [`${item.resource}:${item.action}`, item]),
    );
    const roles = await this.roles.find({
      relations: { permissions: true },
    });
    for (const role of roles) {
      if (isSuperAdminRoleValue(role.value)) continue;
      const held = new Set(
        (role.permissions ?? []).map(
          (item) => `${item.resource}:${item.action}`,
        ),
      );
      let changed = false;
      for (const permission of [...(role.permissions ?? [])]) {
        if ((permission.action as string) !== 'write') continue;
        for (const extra of [
          PermissionAction.Create,
          PermissionAction.Update,
        ] as const) {
          const key = `${permission.resource}:${extra}`;
          if (held.has(key)) continue;
          const target = byKey.get(key);
          if (!target) continue;
          role.permissions.push(target);
          held.add(key);
          changed = true;
        }
      }
      if (changed) {
        await this.roles.save(role);
      }
    }
  }

  /**
   * System role: unlimited via `*`, not bound to the permission catalog.
   * Detaches any leftover role_permissions from older bootstraps.
   */
  async ensureImmutableSuperAdmin(): Promise<RoleDto> {
    const existing = await this.findByValue(SUPER_ADMIN_ROLE_VALUE);
    if (existing) {
      if ((existing.permissions ?? []).length > 0) {
        existing.permissions = [];
        await this.roles.save(existing);
      }
      return this.toPublic(existing);
    }

    const legacyAdmin = await this.findByValue('admin');
    if (legacyAdmin) {
      legacyAdmin.value = SUPER_ADMIN_ROLE_VALUE;
      legacyAdmin.label = 'مدیر کل';
      legacyAdmin.description =
        'Unlimited access — bypasses permission catalog (system role)';
      legacyAdmin.permissions = [];
      this.logger.log('Renamed legacy admin role → super-admin');
      return this.toPublic(await this.roles.save(legacyAdmin));
    }

    try {
      const created = await this.roles.save(
        this.roles.create({
          label: 'مدیر کل',
          value: SUPER_ADMIN_ROLE_VALUE,
          description:
            'Unlimited access — bypasses permission catalog (system role)',
          permissions: [],
        }),
      );
      return this.toPublic(created);
    } catch (error) {
      this.rethrowUnique(error, 'Role value already exists');
    }
  }

  async findAll(
    query: PaginationQuery,
  ): Promise<PaginatedResult<RoleDto>> {
    const { skip, take } = paginationSkipTake(query);
    const [roles, total] = await this.roles.findAndCount({
      relations: { permissions: true },
      order: { label: 'ASC' },
      skip,
      take,
    });
    return toPaginatedResult(
      roles.map((role) => this.toPublic(role)),
      total,
      query,
    );
  }

  async findOne(value: RoleDto['value']): Promise<RoleDto> {
    return this.toPublic(await this.findEntityByValue(value));
  }

  async create(dto: CreateRoleDto): Promise<RoleDto> {
    this.assertNotReservedValue(dto.value);
    const permissions = await this.permissionsService.findByIds(
      dto.permissionIds ?? [],
    );
    const role = this.roles.create({
      label: dto.label,
      value: dto.value,
      description: dto.description ?? null,
      permissions,
    });
    try {
      return this.toPublic(await this.roles.save(role));
    } catch (error) {
      this.rethrowUnique(error, 'Role value already exists');
    }
  }

  async update(
    value: RoleDto['value'],
    dto: UpdateRoleDto,
  ): Promise<RoleDto> {
    this.assertMutable(value);
    if (dto.value !== undefined) {
      this.assertNotReservedValue(dto.value);
    }
    const role = await this.findEntityByValue(value);
    if (dto.label !== undefined) role.label = dto.label;
    if (dto.value !== undefined) role.value = dto.value;
    if (dto.description !== undefined) {
      role.description = dto.description ?? null;
    }
    if (dto.permissionIds !== undefined) {
      role.permissions = await this.permissionsService.findByIds(
        dto.permissionIds,
      );
    }
    try {
      return this.toPublic(await this.roles.save(role));
    } catch (error) {
      this.rethrowUnique(error, 'Role value already exists');
    }
  }

  async setPermissions(
    value: RoleDto['value'],
    dto: SetRolePermissionsDto,
  ): Promise<RoleDto> {
    this.assertMutable(value);
    const role = await this.findEntityByValue(value);
    role.permissions = await this.permissionsService.findByIds(
      dto.permissionIds,
    );
    return this.toPublic(await this.roles.save(role));
  }

  async remove(value: RoleDto['value']): Promise<void> {
    this.assertMutable(value);
    const role = await this.findEntityByValue(value);
    await this.roles.manager
      .createQueryBuilder()
      .delete()
      .from('user_roles')
      .where('role_id = :id', { id: role.id })
      .execute();
    role.permissions = [];
    await this.roles.save(role);
    await this.roles.delete(role.id);
  }

  /** Entity rows for auth / user assignment (lookup by unique `value`). */
  async findByValues(values: RoleDto['value'][]): Promise<Role[]> {
    if (values.length === 0) return [];
    const found = await this.roles.find({ where: { value: In(values) } });
    if (found.length !== values.length) {
      const foundValues = new Set(found.map((r) => r.value));
      const missing = values.filter((v) => !foundValues.has(v));
      throw new NotFoundException(`Roles not found: ${missing.join(', ')}`);
    }
    return found;
  }

  async findByValue(value: RoleDto['value']): Promise<Role | null> {
    return this.roles.findOne({
      where: { value },
      relations: { permissions: true },
    });
  }

  private async findEntityByValue(value: RoleDto['value']): Promise<Role> {
    const role = await this.findByValue(value);
    if (!role) {
      throw new NotFoundException(`Role ${value} not found`);
    }
    return role;
  }

  /** Wire shape: role as `{ label, value }` (Select-compatible). */
  toRoleRef(role: Role): RoleRef {
    return { label: role.label, value: role.value };
  }

  /** Wire shape: permissions as `{ label, value }`. */
  toPublic(role: Role): RoleDto {
    return {
      ...this.toRoleRef(role),
      description: role.description,
      permissions: (role.permissions ?? []).map((permission) =>
        this.toPermissionRef(permission),
      ),
      createdAt: role.createdAt as unknown as string,
      updatedAt: role.updatedAt as unknown as string,
    };
  }

  toPermissionRef(permission: Permission): PermissionRef {
    return {
      label: permission.name,
      value: permission.id,
    };
  }

  private assertMutable(value: RoleDto['value']): void {
    if (isSuperAdminRoleValue(value)) {
      throw new ForbiddenException(
        'System role super-admin cannot be modified or deleted',
      );
    }
  }

  private assertNotReservedValue(value: RoleDto['value']): void {
    if (isSuperAdminRoleValue(value)) {
      throw new ForbiddenException('Role value super-admin is reserved');
    }
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
