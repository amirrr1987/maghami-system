import {
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  Body,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  ApiResultAuthMeResponse,
  ApiResultLoginResponse,
  ApiResultVoidResponse,
  LoginBody,
  UpdateProfileBody,
} from '../common/swagger/openapi.models';
import { AuthService } from './auth.service';
import {
  loginSchema,
  updateProfileSchema,
  type LoginDto,
  type UpdateProfileDto,
} from './auth.schemas';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import type { User } from '../users/user.entity';
import {
  REFRESH_COOKIE_NAME,
  clearRefreshCookie,
  readCookie,
  setRefreshCookie,
} from './refresh-cookie';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'Login — accessToken in body, refreshToken in HttpOnly cookie',
  })
  @ApiBody({ type: LoginBody })
  @ApiOkResponse({ type: ApiResultLoginResponse })
  async login(
    @Body(new ZodValidationPipe(loginSchema)) dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const pair = await this.authService.login(dto);
    setRefreshCookie(response, pair.refreshToken, this.config);
    return pair.login;
  }

  @Public()
  @Post('refresh')
  @ApiOperation({
    summary:
      'Rotate tokens using HttpOnly refresh cookie (no body). Sets a new refresh cookie.',
  })
  @ApiOkResponse({ type: ApiResultLoginResponse })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = readCookie(request, REFRESH_COOKIE_NAME);
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token cookie missing');
    }
    try {
      const pair = await this.authService.refreshFromToken(refreshToken);
      setRefreshCookie(response, pair.refreshToken, this.config);
      return pair.login;
    } catch (error) {
      clearRefreshCookie(response, this.config);
      throw error;
    }
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Clear refresh token cookie' })
  @ApiOkResponse({ type: ApiResultVoidResponse })
  logout(@Res({ passthrough: true }) response: Response): void {
    clearRefreshCookie(response, this.config);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Current user and effective permission codes' })
  @ApiOkResponse({ type: ApiResultAuthMeResponse })
  me(@CurrentUser() user: User) {
    return this.authService.me(user);
  }

  @Patch('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update own name, email, and optional password',
  })
  @ApiBody({ type: UpdateProfileBody })
  @ApiOkResponse({ type: ApiResultAuthMeResponse })
  updateProfile(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(updateProfileSchema)) dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user, dto);
  }
}
