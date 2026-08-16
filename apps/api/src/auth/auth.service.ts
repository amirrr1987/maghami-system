import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type {
  AuthSession,
  LoginDto,
  LoginResult,
  UpdateProfileDto,
} from '@maghami-system/schemas';
import { UsersService } from '../users/users.service';
import type { User } from '../users/user.entity';
import type { JwtPayload } from './jwt-payload';

export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
  login: LoginResult;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<AuthTokenPair> {
    const user = await this.usersService.findEntityByEmail(dto.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.toTokenPair(user);
  }

  async refreshFromToken(refreshToken: string): Promise<AuthTokenPair> {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.refreshSecret(),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (payload.typ !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.usersService.findEntityById(payload.sub);
    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }
    return this.toTokenPair(user);
  }

  me(user: User): AuthSession {
    return {
      user: this.usersService.toAuthUser(user),
      abilities: this.usersService.abilitiesOf(user),
      permissionCodes: this.usersService.permissionCodesOf(user),
    };
  }

  async updateProfile(user: User, dto: UpdateProfileDto): Promise<AuthSession> {
    const updated = await this.usersService.updateOwnProfile(user.id, dto);
    return this.me(updated);
  }

  private accessSecret(): string {
    const secret = this.config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is required');
    }
    return secret;
  }

  private refreshSecret(): string {
    return (
      this.config.get<string>('JWT_REFRESH_SECRET')?.trim() ||
      this.accessSecret()
    );
  }

  private async toTokenPair(user: User): Promise<AuthTokenPair> {
    const base: Omit<JwtPayload, 'typ'> = {
      sub: user.id,
      email: user.email,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { ...base, typ: 'access' } satisfies JwtPayload,
        {
          secret: this.accessSecret(),
          expiresIn: this.config.get<string>('JWT_EXPIRES_IN', '1d'),
        },
      ),
      this.jwtService.signAsync(
        { ...base, typ: 'refresh' } satisfies JwtPayload,
        {
          secret: this.refreshSecret(),
          expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
        },
      ),
    ]);
    const session = this.me(user);
    return {
      accessToken,
      refreshToken,
      login: {
        accessToken,
        tokenType: 'Bearer',
        user: session.user,
        abilities: session.abilities,
        permissionCodes: session.permissionCodes,
      },
    };
  }
}
