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
  ApiResultPaginatedProductBrandsResponse,
  ApiResultProductBrandResponse,
  ApiResultVoidResponse,
  CreateProductBrandBody,
  UpdateProductBrandBody,
} from '../common/swagger/openapi.models';
import { ProductBrandsService } from './product-brands.service';
import {
  createProductBrandSchema,
  updateProductBrandSchema,
  type CreateProductBrandDto,
  type UpdateProductBrandDto,
} from './product-brand.schemas';

@ApiTags('product-brands')
@ApiBearerAuth()
@Controller('product-brands')
export class ProductBrandsController {
  constructor(private readonly brandsService: ProductBrandsService) {}

  @Get()
  @RequireAbility(PermissionAction.Read, PermissionResource.ProductBrands)
  @ApiOperation({ summary: 'List product brands (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiOkResponse({ type: ApiResultPaginatedProductBrandsResponse })
  findAll(
    @Query(new ZodValidationPipe(paginationQuerySchema))
    query: PaginationQuery,
  ) {
    return this.brandsService.findAll(query);
  }

  @Get(':id')
  @RequireAbility(PermissionAction.Read, PermissionResource.ProductBrands)
  @ApiOperation({ summary: 'Get product brand by id' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ type: ApiResultProductBrandResponse })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.brandsService.findOne(id);
  }

  @Post()
  @RequireAbility(PermissionAction.Create, PermissionResource.ProductBrands)
  @ApiOperation({ summary: 'Create product brand' })
  @ApiBody({ type: CreateProductBrandBody })
  @ApiOkResponse({ type: ApiResultProductBrandResponse })
  create(
    @Body(new ZodValidationPipe(createProductBrandSchema))
    dto: CreateProductBrandDto,
  ) {
    return this.brandsService.create(dto);
  }

  @Patch(':id')
  @RequireAbility(PermissionAction.Update, PermissionResource.ProductBrands)
  @ApiOperation({ summary: 'Update product brand' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: UpdateProductBrandBody })
  @ApiOkResponse({ type: ApiResultProductBrandResponse })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateProductBrandSchema))
    dto: UpdateProductBrandDto,
  ) {
    return this.brandsService.update(id, dto);
  }

  @Delete(':id')
  @RequireAbility(PermissionAction.Delete, PermissionResource.ProductBrands)
  @ApiOperation({ summary: 'Delete product brand' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ type: ApiResultVoidResponse })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.brandsService.remove(id);
  }
}
