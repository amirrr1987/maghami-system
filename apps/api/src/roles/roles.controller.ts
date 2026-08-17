import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
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
} from '@maghami-system/schemas';
import { RequireAbility } from '../auth/decorators/require-ability.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  ApiResultPaginatedRolesResponse,
  ApiResultRoleResponse,
  ApiResultVoidResponse,
  CreateRoleBody,
  SetRolePermissionsBody,
  UpdateRoleBody,
} from '../common/swagger/openapi.models';
import {
  createRoleSchema,
  roleValueSchema,
  setRolePermissionsSchema,
  updateRoleSchema,
  type CreateRoleDto,
  type SetRolePermissionsDto,
  type UpdateRoleDto,
} from './role.schemas';
import { RolesService } from './roles.service';

@ApiTags('roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequireAbility(PermissionAction.Read, PermissionResource.Roles)
  @ApiOperation({ summary: 'List roles (paginated for antdv Table)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiOkResponse({ type: ApiResultPaginatedRolesResponse })
  findAll(
    @Query(new ZodValidationPipe(paginationQuerySchema))
    query: PaginationQuery,
  ) {
    return this.rolesService.findAll(query);
  }

  @Get(':id')
  @RequireAbility(PermissionAction.Read, PermissionResource.Roles)
  @ApiOperation({ summary: 'Get role by unique value' })
  @ApiParam({ name: 'id', type: String, example: 'super-admin' })
  @ApiOkResponse({ type: ApiResultRoleResponse })
  findOne(@Param('id', new ZodValidationPipe(roleValueSchema)) id: string) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @RequireAbility(PermissionAction.Create, PermissionResource.Roles)
  @ApiOperation({ summary: 'Create role' })
  @ApiBody({ type: CreateRoleBody })
  @ApiOkResponse({ type: ApiResultRoleResponse })
  create(@Body(new ZodValidationPipe(createRoleSchema)) dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Patch(':id')
  @RequireAbility(PermissionAction.Update, PermissionResource.Roles)
  @ApiOperation({ summary: 'Update role' })
  @ApiParam({ name: 'id', type: String, example: 'super-admin' })
  @ApiBody({ type: UpdateRoleBody })
  @ApiOkResponse({ type: ApiResultRoleResponse })
  update(
    @Param('id', new ZodValidationPipe(roleValueSchema)) id: string,
    @Body(new ZodValidationPipe(updateRoleSchema)) dto: UpdateRoleDto,
  ) {
    return this.rolesService.update(id, dto);
  }

  @Put(':id/permissions')
  @RequireAbility(PermissionAction.Update, PermissionResource.Roles)
  @ApiOperation({ summary: 'Replace role permissions' })
  @ApiParam({ name: 'id', type: String, example: 'super-admin' })
  @ApiBody({ type: SetRolePermissionsBody })
  @ApiOkResponse({ type: ApiResultRoleResponse })
  setPermissions(
    @Param('id', new ZodValidationPipe(roleValueSchema)) id: string,
    @Body(new ZodValidationPipe(setRolePermissionsSchema))
    dto: SetRolePermissionsDto,
  ) {
    return this.rolesService.setPermissions(id, dto);
  }

  @Delete(':id')
  @RequireAbility(PermissionAction.Delete, PermissionResource.Roles)
  @ApiOperation({ summary: 'Delete role' })
  @ApiParam({ name: 'id', type: String, example: 'super-admin' })
  @ApiOkResponse({ type: ApiResultVoidResponse })
  async remove(
    @Param('id', new ZodValidationPipe(roleValueSchema)) id: string,
  ): Promise<void> {
    await this.rolesService.remove(id);
  }
}
