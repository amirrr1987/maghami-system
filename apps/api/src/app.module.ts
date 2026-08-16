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
import { ProductAttributeValue } from './products/product-attribute-value.entity';
import { ProductsModule } from './products/products.module';
import { ProductCategory } from './product-categories/product-category.entity';
import { ProductCategoriesModule } from './product-categories/product-categories.module';
import { ProductBrand } from './product-brands/product-brand.entity';
import { ProductBrandsModule } from './product-brands/product-brands.module';
import { ProductUnit } from './product-units/product-unit.entity';
import { ProductUnitsModule } from './product-units/product-units.module';
import { ProductAttribute } from './product-attributes/product-attribute.entity';
import { ProductAttributesModule } from './product-attributes/product-attributes.module';
import { ProductCodePattern } from './product-code-patterns/product-code-pattern.entity';
import { ProductCodePatternsModule } from './product-code-patterns/product-code-patterns.module';
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
          database: config.get<string>('DATABASE_NAME', 'maghami_system'),
        };
        await ensurePostgresDatabase(connection);
        await repairPermissionsCatalogBeforeSync(connection);
        return {
          type: 'postgres' as const,
          ...connection,
          entities: [
            User,
            Role,
            Permission,
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
    ProductCategoriesModule,
    ProductBrandsModule,
    ProductUnitsModule,
    ProductAttributesModule,
    ProductCodePatternsModule,
    ProductsModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
