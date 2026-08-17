import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Local Swagger models — keep files OpenAPI free of openapi.models import glitches. */
export class StoredFileResponse {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  originalName!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  alt!: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimeType!: string;

  @ApiProperty({ example: 102400 })
  sizeBytes!: number;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;
}

export class ApiResultStoredFileResponse {
  @ApiProperty({ example: 200 })
  status!: number;

  @ApiProperty({ type: [String], example: [] })
  message!: string[];

  @ApiProperty({ example: true })
  isSuccess!: boolean;

  @ApiPropertyOptional({ type: () => StoredFileResponse })
  data?: StoredFileResponse;
}

export class PaginatedStoredFilesResponse {
  @ApiProperty({ type: () => [StoredFileResponse] })
  items!: StoredFileResponse[];

  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  pageSize!: number;
}

export class ApiResultPaginatedStoredFilesResponse {
  @ApiProperty({ example: 200 })
  status!: number;

  @ApiProperty({ type: [String], example: [] })
  message!: string[];

  @ApiProperty({ example: true })
  isSuccess!: boolean;

  @ApiPropertyOptional({ type: () => PaginatedStoredFilesResponse })
  data?: PaginatedStoredFilesResponse;
}
