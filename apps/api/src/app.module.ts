import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ResultInterceptor } from './common/interceptors/result.interceptor';
import {
  ensurePostgresDatabase,
  postgresSocketOptions,
  resolvePostgresHost,
  retryPostgres,
} from './common/ensure-postgres-database';
import { repairPermissionsCatalogBeforeSync } from './common/repair-permissions-catalog';
import { FilesModule } from './files/files.module';
import { FileFolder } from './files/file-folder.entity';
import { StoredFile } from './files/stored-file.entity';
import { Permission } from './permissions/permission.entity';
import { PermissionsModule } from './permissions/permissions.module';
import { ProductAttribute } from './product-attributes/product-attribute.entity';
import { ProductAttributesModule } from './product-attributes/product-attributes.module';
import { ProductBrand } from './product-brands/product-brand.entity';
import { ProductBrandsModule } from './product-brands/product-brands.module';
import { ProductCategory } from './product-categories/product-category.entity';
import { ProductCategoriesModule } from './product-categories/product-categories.module';
import { ProductCodePattern } from './product-code-patterns/product-code-pattern.entity';
import { ProductCodePatternsModule } from './product-code-patterns/product-code-patterns.module';
import { ProductAttributeValue } from './products/product-attribute-value.entity';
import { Product } from './products/product.entity';
import { ProductsModule } from './products/products.module';
import { ProductUnit } from './product-units/product-unit.entity';
import { ProductUnitsModule } from './product-units/product-units.module';
import { Role } from './roles/role.entity';
import { RolesModule } from './roles/roles.module';
import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(__dirname, '..', '..', '.env'),
        join(__dirname, '..', '.env'),
      ],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const hostName = config.get<string>('DATABASE_HOST', 'localhost');
        const host = await retryPostgres(() => resolvePostgresHost(hostName));
        const connection = {
          host,
          port: Number(config.get<string>('DATABASE_PORT', '5432')),
          username: config.get<string>('DATABASE_USER', 'postgres'),
          password: config.get<string>('DATABASE_PASSWORD', 'postgres'),
          database: config.get<string>('DATABASE_NAME', 'maghami-system'),
        };
        await retryPostgres(() => ensurePostgresDatabase(connection));
        await retryPostgres(() =>
          repairPermissionsCatalogBeforeSync(connection),
        );
        return {
          type: 'postgres' as const,
          ...connection,
          ...postgresSocketOptions,
          retryAttempts: 10,
          retryDelay: 3000,
          entities: [
            User,
            Role,
            Permission,
            StoredFile,
            FileFolder,
            Product,
            ProductAttributeValue,
            ProductCategory,
            ProductBrand,
            ProductUnit,
            ProductAttribute,
            ProductCodePattern,
          ],
          synchronize: config.get<string>('TYPEORM_SYNC', 'true') === 'true',
        };
      },
    }),
    PermissionsModule,
    RolesModule,
    UsersModule,
    FilesModule,
    ProductCategoriesModule,
    ProductBrandsModule,
    ProductUnitsModule,
    ProductAttributesModule,
    ProductCodePatternsModule,
    ProductsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_INTERCEPTOR, useClass: ResultInterceptor }],
})
export class AppModule {}
