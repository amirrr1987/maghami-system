import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type {
  AbilityRule,
  AuthUser,
  PaginatedResult,
  PaginationQuery,
  UpdateProfileDto,
  User as UserDto,
} from '@maghami-system/schemas';
import {
  isSuperAdminRoleValue,
  paginationSkipTake,
  SUPER_ADMIN_ABILITY,
  SUPER_ADMIN_PERMISSION_CODE,
  toPaginatedResult,
} from '@maghami-system/schemas';
import * as bcrypt from 'bcrypt';
import { QueryFailedError, Repository } from 'typeorm';
import { RolesService } from '../roles/roles.service';
import { User } from './user.entity';
import type {
  CreateUserDto,
  SetUserRolesDto,
  UpdateUserDto,
} from './user.schemas';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly rolesService: RolesService,
  ) {}

  async findAll(
    query: PaginationQuery,
  ): Promise<PaginatedResult<UserDto>> {
    const { skip, take } = paginationSkipTake(query);
    const [users, total] = await this.users.findAndCount({
      relations: { roles: true },
      order: { email: 'ASC' },
      skip,
      take,
    });
    return toPaginatedResult(
      users.map((u) => this.toPublic(u)),
      total,
      query,
    );
  }

  async findOne(id: string): Promise<UserDto> {
    return this.toPublic(await this.findEntityById(id));
  }

  /** Full entity with roles→permissions (for auth permission resolution only). */
  async findEntityById(id: string): Promise<User> {
    const user = await this.users.findOne({
      where: { id },
      relations: { roles: { permissions: true } },
    });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  async findEntityByEmail(email: string): Promise<User | null> {
    return this.users.findOne({
      where: { email: email.toLowerCase() },
      relations: { roles: { permissions: true } },
    });
  }

  /** Role `super-admin` → unlimited access (API + client sentinel `*`). */
  isSuperAdmin(user: User): boolean {
    return (user.roles ?? []).some(
      (role) => isSuperAdminRoleValue(role.value),
    );
  }

  /**
   * Effective CASL rules from role permissions (`resource` + `action`).
   * Super-admin gets manage/all.
   */
  abilitiesOf(user: User): AbilityRule[] {
    if (this.isSuperAdmin(user)) {
      return [SUPER_ADMIN_ABILITY];
    }
    const seen = new Set<string>();
    const rules: AbilityRule[] = [];
    for (const role of user.roles ?? []) {
      for (const permission of role.permissions ?? []) {
        const key = `${permission.action}:${permission.resource}`;
        if (seen.has(key)) continue;
        seen.add(key);
        rules.push({
          action: permission.action,
          subject: permission.resource,
        });
      }
    }
    return rules;
  }

  /** Derived `resource:action` keys for display. Super-admin also gets `*`. */
  permissionCodesOf(user: User): string[] {
    const codes = new Set<string>();
    if (this.isSuperAdmin(user)) {
      codes.add(SUPER_ADMIN_PERMISSION_CODE);
    }
    for (const role of user.roles ?? []) {
      for (const permission of role.permissions ?? []) {
        codes.add(`${permission.resource}:${permission.action}`);
      }
    }
    return [...codes].sort();
  }

  toAuthUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
    };
  }

  assertNotSelf(actorId: string, targetId: string, action: string): void {
    if (actorId === targetId) {
      throw new ForbiddenException(`You cannot ${action} your own account`);
    }
  }

  async updateOwnProfile(
    id: string,
    dto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.findEntityById(id);
    user.email = dto.email.toLowerCase();
    user.name = dto.name;
    if (dto.password !== undefined) {
      user.passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    }
    try {
      await this.users.save(user);
    } catch (error) {
      this.rethrowUnique(error, 'Email already exists');
    }
    return this.findEntityById(id);
  }

  async create(dto: CreateUserDto): Promise<UserDto> {
    const roles = await this.rolesService.findByValues(dto.roleIds ?? []);
    const user = this.users.create({
      email: dto.email.toLowerCase(),
      name: dto.name,
      passwordHash: await bcrypt.hash(dto.password, SALT_ROUNDS),
      isActive: dto.isActive ?? true,
      roles,
    });
    try {
      return this.toPublic(await this.users.save(user));
    } catch (error) {
      this.rethrowUnique(error, 'Email already exists');
    }
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDto> {
    const user = await this.findEntityById(id);
    if (dto.name !== undefined) user.name = dto.name;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    if (dto.password !== undefined) {
      user.passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    }
    if (dto.roleIds !== undefined) {
      user.roles = await this.rolesService.findByValues(dto.roleIds);
    }
    try {
      return this.toPublic(await this.users.save(user));
    } catch (error) {
      this.rethrowUnique(error, 'Email already exists');
    }
  }

  async setRoles(id: string, dto: SetUserRolesDto): Promise<UserDto> {
    const user = await this.findEntityById(id);
    user.roles = await this.rolesService.findByValues(dto.roleIds);
    return this.toPublic(await this.users.save(user));
  }

  async remove(id: string): Promise<void> {
    const result = await this.users.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`User ${id} not found`);
    }
  }

  /** Public user DTO: roles without nested permissions (not sent to web). */
  private toPublic(user: User): UserDto {
    const roles = (user.roles ?? []).map((role) =>
      this.rolesService.toRoleRef(role),
    );
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      roles,
      createdAt: user.createdAt as unknown as string,
      updatedAt: user.updatedAt as unknown as string,
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
