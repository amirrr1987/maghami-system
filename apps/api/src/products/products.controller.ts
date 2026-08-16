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
import { PermissionAction, PermissionResource } from '@maghami-system/schemas';
import { RequireAbility } from '../auth/decorators/require-ability.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  ApiResultPaginatedProductsResponse,
  ApiResultProductResponse,
  ApiResultSkuPreviewResponse,
  ApiResultVoidResponse,
  CreateProductBody,
  UpdateProductBody,
} from '../common/swagger/openapi.models';
import {
  createProductSchema,
  productListQuerySchema,
  updateProductSchema,
  type CreateProductDto,
  type ProductListQuery,
  type UpdateProductDto,
} from './product.schemas';
import { ProductsService } from './products.service';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @RequireAbility(PermissionAction.Read, PermissionResource.Products)
  @ApiOperation({ summary: 'List products (paginated, searchable)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'brandId', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiOkResponse({ type: ApiResultPaginatedProductsResponse })
  findAll(
    @Query(new ZodValidationPipe(productListQuerySchema))
    query: ProductListQuery,
  ) {
    return this.productsService.findAll(query);
  }

  @Get('sku-preview')
  @RequireAbility(PermissionAction.Create, PermissionResource.Products)
  @ApiOperation({
    summary: 'Preview next SKU for a category (does not allocate)',
  })
  @ApiQuery({ name: 'categoryId', required: true, type: String })
  @ApiOkResponse({ type: ApiResultSkuPreviewResponse })
  previewSku(@Query('categoryId', ParseUUIDPipe) categoryId: string) {
    return this.productsService.previewSku(categoryId);
  }

  @Get(':id')
  @RequireAbility(PermissionAction.Read, PermissionResource.Products)
  @ApiOperation({ summary: 'Get product by id' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ type: ApiResultProductResponse })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @RequireAbility(PermissionAction.Create, PermissionResource.Products)
  @ApiOperation({
    summary: 'Create product (SKU auto-generated when omitted)',
  })
  @ApiBody({ type: CreateProductBody })
  @ApiOkResponse({ type: ApiResultProductResponse })
  create(
    @Body(new ZodValidationPipe(createProductSchema)) dto: CreateProductDto,
  ) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @RequireAbility(PermissionAction.Update, PermissionResource.Products)
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: UpdateProductBody })
  @ApiOkResponse({ type: ApiResultProductResponse })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateProductSchema)) dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @RequireAbility(PermissionAction.Delete, PermissionResource.Products)
  @ApiOperation({ summary: 'Delete product' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ type: ApiResultVoidResponse })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.productsService.remove(id);
  }
}
