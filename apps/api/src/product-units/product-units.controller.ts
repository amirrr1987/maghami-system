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
} from '@maghami-system/schemas';
import { RequireAbility } from '../auth/decorators/require-ability.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  ApiResultPaginatedProductUnitsResponse,
  ApiResultProductUnitResponse,
  ApiResultVoidResponse,
  CreateProductUnitBody,
  UpdateProductUnitBody,
} from '../common/swagger/openapi.models';
import { ProductUnitsService } from './product-units.service';
import {
  createProductUnitSchema,
  updateProductUnitSchema,
  type CreateProductUnitDto,
  type UpdateProductUnitDto,
} from './product-unit.schemas';

@ApiTags('product-units')
@ApiBearerAuth()
@Controller('product-units')
export class ProductUnitsController {
  constructor(private readonly unitsService: ProductUnitsService) {}

  @Get()
  @RequireAbility(PermissionAction.Read, PermissionResource.ProductUnits)
  @ApiOperation({ summary: 'List product units (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiOkResponse({ type: ApiResultPaginatedProductUnitsResponse })
  findAll(
    @Query(new ZodValidationPipe(paginationQuerySchema))
    query: PaginationQuery,
  ) {
    return this.unitsService.findAll(query);
  }

  @Get(':id')
  @RequireAbility(PermissionAction.Read, PermissionResource.ProductUnits)
  @ApiOperation({ summary: 'Get product unit by id' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ type: ApiResultProductUnitResponse })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.unitsService.findOne(id);
  }

  @Post()
  @RequireAbility(PermissionAction.Create, PermissionResource.ProductUnits)
  @ApiOperation({ summary: 'Create product unit' })
  @ApiBody({ type: CreateProductUnitBody })
  @ApiOkResponse({ type: ApiResultProductUnitResponse })
  create(
    @Body(new ZodValidationPipe(createProductUnitSchema))
    dto: CreateProductUnitDto,
  ) {
    return this.unitsService.create(dto);
  }

  @Patch(':id')
  @RequireAbility(PermissionAction.Update, PermissionResource.ProductUnits)
  @ApiOperation({ summary: 'Update product unit' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: UpdateProductUnitBody })
  @ApiOkResponse({ type: ApiResultProductUnitResponse })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateProductUnitSchema))
    dto: UpdateProductUnitDto,
  ) {
    return this.unitsService.update(id, dto);
  }

  @Delete(':id')
  @RequireAbility(PermissionAction.Delete, PermissionResource.ProductUnits)
  @ApiOperation({ summary: 'Delete product unit' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ type: ApiResultVoidResponse })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.unitsService.remove(id);
  }
}
