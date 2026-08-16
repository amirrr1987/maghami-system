import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequireAbility } from '../auth/decorators/require-ability.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  ApiResultPaginatedUsersResponse,
  ApiResultUserResponse,
  ApiResultVoidResponse,
  CreateUserBody,
  SetUserRolesBody,
  UpdateUserBody,
} from '../common/swagger/openapi.models';
import type { User } from './user.entity';
import {
  createUserSchema,
  setUserRolesSchema,
  updateUserSchema,
  type CreateUserDto,
  type SetUserRolesDto,
  type UpdateUserDto,
} from './user.schemas';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequireAbility(PermissionAction.Read, PermissionResource.Users)
  @ApiOperation({ summary: 'List users (paginated for antdv Table)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiOkResponse({ type: ApiResultPaginatedUsersResponse })
  findAll(
    @Query(new ZodValidationPipe(paginationQuerySchema))
    query: PaginationQuery,
  ) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @RequireAbility(PermissionAction.Read, PermissionResource.Users)
  @ApiOperation({ summary: 'Get user by id' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ type: ApiResultUserResponse })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @RequireAbility(PermissionAction.Create, PermissionResource.Users)
  @ApiOperation({ summary: 'Create user' })
  @ApiBody({ type: CreateUserBody })
  @ApiOkResponse({ type: ApiResultUserResponse })
  create(
    @Body(new ZodValidationPipe(createUserSchema)) dto: CreateUserDto,
  ) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @RequireAbility(PermissionAction.Update, PermissionResource.Users)
  @ApiOperation({ summary: 'Update user (not yourself)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: UpdateUserBody })
  @ApiOkResponse({ type: ApiResultUserResponse })
  update(
    @CurrentUser() actor: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateUserSchema)) dto: UpdateUserDto,
  ) {
    this.usersService.assertNotSelf(actor.id, id, 'update');
    return this.usersService.update(id, dto);
  }

  @Put(':id/roles')
  @RequireAbility(PermissionAction.Update, PermissionResource.Users)
  @ApiOperation({ summary: 'Replace user roles (not yourself)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: SetUserRolesBody })
  @ApiOkResponse({ type: ApiResultUserResponse })
  setRoles(
    @CurrentUser() actor: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(setUserRolesSchema)) dto: SetUserRolesDto,
  ) {
    this.usersService.assertNotSelf(actor.id, id, 'change roles for');
    return this.usersService.setRoles(id, dto);
  }

  @Delete(':id')
  @RequireAbility(PermissionAction.Delete, PermissionResource.Users)
  @ApiOperation({ summary: 'Delete user (not yourself)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ type: ApiResultVoidResponse })
  async remove(
    @CurrentUser() actor: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    this.usersService.assertNotSelf(actor.id, id, 'delete');
    await this.usersService.remove(id);
  }
}
