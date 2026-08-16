---
name: nestjs-swagger
description: >
  Type-safe NestJS OpenAPI/Swagger with @nestjs/swagger — DocumentBuilder,
  SwaggerModule, ApiTags, ApiProperty, ApiBody, ApiOkResponse. Use when adding
  or updating API docs, Swagger UI, OpenAPI models, or decorating controllers.
---

# @nestjs/swagger (type-safe)

Docs: [docs.nestjs.com/openapi](https://docs.nestjs.com/openapi/introduction).  
Confirm version in `apps/api/package.json` (`@nestjs/swagger` ^7 with Nest 10).

## Source of truth

Use types and decorators **exported by `@nestjs/swagger`** — do not invent parallel OpenAPI interfaces:

```ts
import {
  ApiProperty,
  ApiPropertyOptional,
  ApiTags,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiNoContentResponse,
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';
import type { OpenAPIObject } from '@nestjs/swagger';
```

- Model fields with `ApiProperty` / `ApiPropertyOptional` on **classes** (Swagger reflection)
- Prefer `type: () => [NestedModel]` for nested / circular refs
- Prefer `format: 'uuid' | 'date-time' | 'password'` where relevant
- Do **not** use `any` in model fields or decorator options

## Bootstrap (this repo)

UI path: **`/docs`**. Wired in `apps/api/src/main.ts`:

```ts
const swaggerConfig = new DocumentBuilder()
  .setTitle('Monitoring API')
  .setDescription('…')
  .setVersion('0.0.0')
  .addBearerAuth()
  .addTag('users')
  .build();
const document: OpenAPIObject = SwaggerModule.createDocument(app, swaggerConfig);
registerOpenApiIdSchemas(document);
SwaggerModule.setup('docs', app, document);
```

Protected routes: `@ApiBearerAuth()` on the controller; public: `@Public()`.

## Zod + Swagger split (this repo)

- **Runtime validation**: Zod schemas + `ZodValidationPipe` (`*.schemas.ts`)
- **OpenAPI models**: classes with `ApiProperty*` in `common/swagger/openapi.models.ts`
- **Reusable id schemas**: `PermissionId` / `UserId` / `ProductId` (uuid), `RoleId` (`Role.value` slug) in `openapi.ids.ts` + `registerOpenApiIdSchemas`
- **TypeScript types**: still `Permission['id']` / `Role['value']` on model fields (not free-floating string)
- Controllers keep `CreateXDto = z.infer<…>` for handlers; use `@ApiBody({ type: CreateXBody })` for docs

### ID `$ref` pattern (mandatory)

OpenAPI uses **top-level** id schemas (stable for Swagger). Do **not** `$ref` into `*Response/properties/id`.

```ts
import { permissionIdRef, roleIdRef } from '../common/swagger/openapi.ids';
import type { Permission, Role } from '@vue-nestjs-admin-template/schemas';

@ApiProperty({ allOf: [permissionIdRef] })
id!: Permission['id'];

@ApiPropertyOptional({
  type: 'array',
  items: permissionIdRef, // → #/components/schemas/PermissionId
})
permissionIds?: Permission['id'][];

@ApiParam({ name: 'id', schema: roleIdRef })
```

Nest `@ApiParam({ schema })` only accepts `SchemaObject` (not `$ref`). Prefer:

```ts
@ApiParam({ name: 'id', type: String, format: 'uuid' })
```

Keep `$ref` for body/response fields via `items` / `allOf`.

```yaml
PermissionId:
  type: string
  format: uuid
permissionIds:
  type: array
  items:
    $ref: '#/components/schemas/PermissionId'
```

Never replace Zod DTOs with untyped `any` bodies just to satisfy Swagger.

## Controller pattern

```ts
@ApiTags('users')
@Controller('users')
export class UsersController {
  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiBody({ type: CreateUserBody })
  @ApiOkResponse({ type: UserResponse })
  create(
    @Body(new ZodValidationPipe(createUserSchema)) dto: CreateUserDto,
  ) {
    return this.usersService.create(dto);
  }
}
```

## Anti-patterns

- Hand-rolled OpenAPI JSON that drifts from `@ApiProperty` models
- Documenting request bodies only as `object` without properties
- Putting `passwordHash` on public response models
- Skipping `@ApiTags` (UI becomes one flat list)
- `$ref: '#/components/schemas/X/properties/id'` (fragile nested property refs)

## After changing models

Keep `openapi.models.ts` aligned with Zod schemas (fields, required/optional, max lengths).
