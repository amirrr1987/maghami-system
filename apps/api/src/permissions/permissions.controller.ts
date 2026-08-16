import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  paginationQuerySchema,
  PermissionAction,
  PermissionResource,
  type PaginationQuery,
} from '@vue-nestjs-admin-template/schemas';
import { RequireAbility } from '../auth/decorators/require-ability.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  ApiResultPaginatedPermissionsResponse,
  ApiResultPermissionResponse,
  ApiResultVoidResponse,
  CreatePermissionBody,
  UpdatePermissionBody,
} from '../common/swagger/openapi.models';
import {
  createPermissionSchema,
  updatePermissionSchema,
  type CreatePermissionDto,
  type UpdatePermissionDto,
} from './permission.schemas';
import { PermissionsService } from './permissions.service';

@ApiTags('permissions')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @RequireAbility(PermissionAction.Read, PermissionResource.Permissions)
  @ApiOperation({ summary: 'List permissions (paginated for antdv Table)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiOkResponse({ type: ApiResultPaginatedPermissionsResponse })
  findAll(
    @Query(new ZodValidationPipe(paginationQuerySchema))
    query: PaginationQuery,
  ) {
    return this.permissionsService.findAll(query);
  }

  @Get(':id')
  @RequireAbility(PermissionAction.Read, PermissionResource.Permissions)
  @ApiOperation({ summary: 'Get permission by id' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ type: ApiResultPermissionResponse })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionsService.findOne(id);
  }

  @Post()
  @RequireAbility(PermissionAction.Create, PermissionResource.Permissions)
  @ApiOperation({ summary: 'Create permission' })
  @ApiBody({ type: CreatePermissionBody })
  @ApiOkResponse({ type: ApiResultPermissionResponse })
  create(
    @Body(new ZodValidationPipe(createPermissionSchema))
    dto: CreatePermissionDto,
  ) {
    return this.permissionsService.create(dto);
  }

  @Patch(':id')
  @RequireAbility(PermissionAction.Update, PermissionResource.Permissions)
  @ApiOperation({ summary: 'Update permission' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: UpdatePermissionBody })
  @ApiOkResponse({ type: ApiResultPermissionResponse })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updatePermissionSchema))
    dto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(id, dto);
  }

  @Delete(':id')
  @RequireAbility(PermissionAction.Delete, PermissionResource.Permissions)
  @ApiOperation({ summary: 'Delete permission' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ type: ApiResultVoidResponse })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.permissionsService.remove(id);
  }
}
