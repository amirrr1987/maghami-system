import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { Permission } from './permissions/permission.entity';
import { PermissionsModule } from './permissions/permissions.module';
import { Role } from './roles/role.entity';
import { RolesModule } from './roles/roles.module';
import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';
import { Product } from './products/product.entity';
import { ProductsModule } from './products/products.module';
import { ensurePostgresDatabase } from './common/ensure-postgres-database';
import { repairPermissionsCatalogBeforeSync } from './common/repair-permissions-catalog';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'apps/api/.env'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const connection = {
          host: config.get<string>('DATABASE_HOST', 'localhost'),
          port: Number(config.get<string>('DATABASE_PORT', '5432')),
          username: config.get<string>('DATABASE_USER', 'postgres'),
          password: config.get<string>('DATABASE_PASSWORD', 'postgres'),
          database: config.get<string>('DATABASE_NAME', 'vue_nestjs_admin_template'),
        };
        await ensurePostgresDatabase(connection);
        await repairPermissionsCatalogBeforeSync(connection);
        return {
          type: 'postgres' as const,
          ...connection,
          entities: [User, Role, Permission, Product],
          synchronize: config.get<string>('TYPEORM_SYNC', 'true') === 'true',
        };
      },
    }),
    PermissionsModule,
    RolesModule,
    UsersModule,
    ProductsModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
