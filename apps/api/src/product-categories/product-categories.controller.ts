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
  ApiResultPaginatedProductCategoriesResponse,
  ApiResultProductCategoryResponse,
  ApiResultProductCategoryTreeResponse,
  ApiResultVoidResponse,
  CreateProductCategoryBody,
  UpdateProductCategoryBody,
} from '../common/swagger/openapi.models';
import { ProductCategoriesService } from './product-categories.service';
import {
  createProductCategorySchema,
  updateProductCategorySchema,
  type CreateProductCategoryDto,
  type UpdateProductCategoryDto,
} from './product-category.schemas';

@ApiTags('product-categories')
@ApiBearerAuth()
@Controller('product-categories')
export class ProductCategoriesController {
  constructor(private readonly categoriesService: ProductCategoriesService) {}

  @Get()
  @RequireAbility(PermissionAction.Read, PermissionResource.ProductCategories)
  @ApiOperation({ summary: 'List product categories (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiOkResponse({ type: ApiResultPaginatedProductCategoriesResponse })
  findAll(
    @Query(new ZodValidationPipe(paginationQuerySchema))
    query: PaginationQuery,
  ) {
    return this.categoriesService.findAll(query);
  }

  @Get('tree')
  @RequireAbility(PermissionAction.Read, PermissionResource.ProductCategories)
  @ApiOperation({ summary: 'List product categories as a nested tree' })
  @ApiOkResponse({ type: ApiResultProductCategoryTreeResponse })
  findTree() {
    return this.categoriesService.findTree();
  }

  @Get(':id')
  @RequireAbility(PermissionAction.Read, PermissionResource.ProductCategories)
  @ApiOperation({ summary: 'Get product category by id' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ type: ApiResultProductCategoryResponse })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @RequireAbility(PermissionAction.Create, PermissionResource.ProductCategories)
  @ApiOperation({ summary: 'Create product category' })
  @ApiBody({ type: CreateProductCategoryBody })
  @ApiOkResponse({ type: ApiResultProductCategoryResponse })
  create(
    @Body(new ZodValidationPipe(createProductCategorySchema))
    dto: CreateProductCategoryDto,
  ) {
    return this.categoriesService.create(dto);
  }

  @Patch(':id')
  @RequireAbility(PermissionAction.Update, PermissionResource.ProductCategories)
  @ApiOperation({ summary: 'Update product category' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: UpdateProductCategoryBody })
  @ApiOkResponse({ type: ApiResultProductCategoryResponse })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateProductCategorySchema))
    dto: UpdateProductCategoryDto,
  ) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @RequireAbility(PermissionAction.Delete, PermissionResource.ProductCategories)
  @ApiOperation({ summary: 'Delete product category' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ type: ApiResultVoidResponse })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.categoriesService.remove(id);
  }
}
