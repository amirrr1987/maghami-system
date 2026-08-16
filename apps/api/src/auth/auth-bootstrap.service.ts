import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PERMISSION_ACTIONS,
  PermissionAction,
  PermissionResource,
  SEEDED_PERMISSION_RESOURCES,
} from '@vue-nestjs-admin-template/schemas';
import { PermissionsService } from '../permissions/permissions.service';
import { RolesService } from '../roles/roles.service';
import { UsersService } from '../users/users.service';

const RESOURCE_LABEL_FA: Readonly<
  Record<(typeof SEEDED_PERMISSION_RESOURCES)[number], string>
> = {
  [PermissionResource.Users]: 'کاربران',
  [PermissionResource.Roles]: 'نقش‌ها',
  [PermissionResource.Permissions]: 'مجوزها',
  [PermissionResource.Products]: 'محصولات',
  [PermissionResource.ProductCategories]: 'دسته‌بندی کالا',
  [PermissionResource.ProductBrands]: 'برند کالا',
  [PermissionResource.ProductUnits]: 'واحد کالا',
  [PermissionResource.ProductAttributes]: 'ویژگی کالا',
  [PermissionResource.ProductCodePatterns]: 'الگوی کدینگ کالا',
};

const ACTION_LABEL_FA: Readonly<Record<PermissionAction, string>> = {
  [PermissionAction.Read]: 'خواندن',
  [PermissionAction.Create]: 'ایجاد',
  [PermissionAction.Update]: 'ویرایش',
  [PermissionAction.Delete]: 'حذف',
};

/**
 * Ensures catalog permissions (RBAC + Product Coding), `super-admin` role,
 * and bootstrap user. Controlled by BOOTSTRAP_ADMIN_EMAIL + BOOTSTRAP_ADMIN_PASSWORD.
 */
@Injectable()
export class AuthBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(AuthBootstrapService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly permissionsService: PermissionsService,
    private readonly rolesService: RolesService,
    private readonly usersService: UsersService,
  ) {}

  async onModuleInit(): Promise<void> {
    for (const resource of SEEDED_PERMISSION_RESOURCES) {
      const resourceLabel = RESOURCE_LABEL_FA[resource];
      for (const action of PERMISSION_ACTIONS) {
        const actionLabel = ACTION_LABEL_FA[action];
        const label = `${actionLabel} ${resourceLabel}`;
        await this.permissionsService.ensure(
          resource,
          action,
          label,
          label,
        );
      }
    }

    await this.rolesService.backfillEmptyLabels();
    await this.rolesService.copyWriteGrantsToCreateUpdate();
    const superAdminRole = await this.rolesService.ensureImmutableSuperAdmin();

    const email = this.config.get<string>('BOOTSTRAP_ADMIN_EMAIL')?.trim();
    const password = this.config.get<string>('BOOTSTRAP_ADMIN_PASSWORD');
    if (!email || !password) {
      this.logger.warn(
        'BOOTSTRAP_ADMIN_EMAIL/PASSWORD not set — create a super-admin user manually',
      );
      return;
    }

    const existing = await this.usersService.findEntityByEmail(email);
    const name =
      this.config.get<string>('BOOTSTRAP_ADMIN_NAME')?.trim() || 'super-admin';

    if (existing) {
      await this.usersService.update(existing.id, {
        name,
        password,
        isActive: true,
        roleIds: [superAdminRole.value],
      });
      this.logger.log(`Bootstrap super-admin user reset: ${email}`);
      return;
    }

    await this.usersService.create({
      email,
      name,
      password,
      isActive: true,
      roleIds: [superAdminRole.value],
    });
    this.logger.log(`Bootstrap super-admin user created: ${email}`);
  }
}
