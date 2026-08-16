import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './auth/decorators/public.decorator';
import { ApiResultStringResponse } from './common/swagger/openapi.models';

@ApiTags('health')
@Controller()
export class AppController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Health / hello' })
  @ApiOkResponse({ type: ApiResultStringResponse })
  getHello(): string {
    return 'Hello from API';
  }
}
