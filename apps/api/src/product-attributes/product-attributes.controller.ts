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
  ApiResultPaginatedProductAttributesResponse,
  ApiResultProductAttributeResponse,
  ApiResultVoidResponse,
  CreateProductAttributeBody,
  UpdateProductAttributeBody,
} from '../common/swagger/openapi.models';
import { ProductAttributesService } from './product-attributes.service';
import {
  createProductAttributeSchema,
  updateProductAttributeSchema,
  type CreateProductAttributeDto,
  type UpdateProductAttributeDto,
} from './product-attribute.schemas';

@ApiTags('product-attributes')
@ApiBearerAuth()
@Controller('product-attributes')
export class ProductAttributesController {
  constructor(private readonly attributesService: ProductAttributesService) {}

  @Get()
  @RequireAbility(PermissionAction.Read, PermissionResource.ProductAttributes)
  @ApiOperation({ summary: 'List product attributes (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiOkResponse({ type: ApiResultPaginatedProductAttributesResponse })
  findAll(
    @Query(new ZodValidationPipe(paginationQuerySchema))
    query: PaginationQuery,
  ) {
    return this.attributesService.findAll(query);
  }

  @Get(':id')
  @RequireAbility(PermissionAction.Read, PermissionResource.ProductAttributes)
  @ApiOperation({ summary: 'Get product attribute by id' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ type: ApiResultProductAttributeResponse })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.attributesService.findOne(id);
  }

  @Post()
  @RequireAbility(PermissionAction.Create, PermissionResource.ProductAttributes)
  @ApiOperation({ summary: 'Create product attribute' })
  @ApiBody({ type: CreateProductAttributeBody })
  @ApiOkResponse({ type: ApiResultProductAttributeResponse })
  create(
    @Body(new ZodValidationPipe(createProductAttributeSchema))
    dto: CreateProductAttributeDto,
  ) {
    return this.attributesService.create(dto);
  }

  @Patch(':id')
  @RequireAbility(PermissionAction.Update, PermissionResource.ProductAttributes)
  @ApiOperation({ summary: 'Update product attribute' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: UpdateProductAttributeBody })
  @ApiOkResponse({ type: ApiResultProductAttributeResponse })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateProductAttributeSchema))
    dto: UpdateProductAttributeDto,
  ) {
    return this.attributesService.update(id, dto);
  }

  @Delete(':id')
  @RequireAbility(PermissionAction.Delete, PermissionResource.ProductAttributes)
  @ApiOperation({ summary: 'Delete product attribute' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ type: ApiResultVoidResponse })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.attributesService.remove(id);
  }
}
