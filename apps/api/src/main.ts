import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ResultExceptionFilter } from './common/filters/result-exception.filter';
import { ResultInterceptor } from './common/interceptors/result.interceptor';
import { registerOpenApiIdSchemas } from './common/swagger/openapi.ids';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('v1');
  app.useGlobalInterceptors(new ResultInterceptor());
  app.useGlobalFilters(new ResultExceptionFilter());

  const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
  app.enableCors({
    origin: corsOrigin.includes(',')
      ? corsOrigin.split(',').map((value) => value.trim())
      : corsOrigin,
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Monitoring API')
    .setDescription(
      'Dynamic RBAC API — permissions, roles, users, and JWT auth (Zod-validated). Uniform ApiResult envelope under /v1.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('health')
    .addTag('auth')
    .addTag('permissions')
    .addTag('products')
    .addTag('product-categories')
    .addTag('product-brands')
    .addTag('product-units')
    .addTag('product-attributes')
    .addTag('product-code-patterns')
    .addTag('roles')
    .addTag('users')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  registerOpenApiIdSchemas(document);
  SwaggerModule.setup('docs', app, document);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
}

void bootstrap();
