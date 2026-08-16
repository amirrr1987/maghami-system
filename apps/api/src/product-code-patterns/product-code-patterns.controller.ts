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
  ApiResultPaginatedProductCodePatternsResponse,
  ApiResultProductCodePatternResponse,
  ApiResultVoidResponse,
  CreateProductCodePatternBody,
  UpdateProductCodePatternBody,
} from '../common/swagger/openapi.models';
import { ProductCodePatternsService } from './product-code-patterns.service';
import {
  createProductCodePatternSchema,
  updateProductCodePatternSchema,
  type CreateProductCodePatternDto,
  type UpdateProductCodePatternDto,
} from './product-code-pattern.schemas';

@ApiTags('product-code-patterns')
@ApiBearerAuth()
@Controller('product-code-patterns')
export class ProductCodePatternsController {
  constructor(private readonly patternsService: ProductCodePatternsService) {}

  @Get()
  @RequireAbility(PermissionAction.Read, PermissionResource.ProductCodePatterns)
  @ApiOperation({ summary: 'List product code patterns (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiOkResponse({ type: ApiResultPaginatedProductCodePatternsResponse })
  findAll(
    @Query(new ZodValidationPipe(paginationQuerySchema))
    query: PaginationQuery,
  ) {
    return this.patternsService.findAll(query);
  }

  @Get(':id')
  @RequireAbility(PermissionAction.Read, PermissionResource.ProductCodePatterns)
  @ApiOperation({ summary: 'Get product code pattern by id' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ type: ApiResultProductCodePatternResponse })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.patternsService.findOne(id);
  }

  @Post()
  @RequireAbility(
    PermissionAction.Create,
    PermissionResource.ProductCodePatterns,
  )
  @ApiOperation({ summary: 'Create product code pattern' })
  @ApiBody({ type: CreateProductCodePatternBody })
  @ApiOkResponse({ type: ApiResultProductCodePatternResponse })
  create(
    @Body(new ZodValidationPipe(createProductCodePatternSchema))
    dto: CreateProductCodePatternDto,
  ) {
    return this.patternsService.create(dto);
  }

  @Patch(':id')
  @RequireAbility(
    PermissionAction.Update,
    PermissionResource.ProductCodePatterns,
  )
  @ApiOperation({ summary: 'Update product code pattern' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: UpdateProductCodePatternBody })
  @ApiOkResponse({ type: ApiResultProductCodePatternResponse })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateProductCodePatternSchema))
    dto: UpdateProductCodePatternDto,
  ) {
    return this.patternsService.update(id, dto);
  }

  @Delete(':id')
  @RequireAbility(
    PermissionAction.Delete,
    PermissionResource.ProductCodePatterns,
  )
  @ApiOperation({ summary: 'Delete product code pattern' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ type: ApiResultVoidResponse })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.patternsService.remove(id);
  }
}
