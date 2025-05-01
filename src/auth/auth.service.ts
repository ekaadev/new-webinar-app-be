import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, TokenResponse } from '../model/user.model';
import { User } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async register(user: User): Promise<TokenResponse> {
    this.logger.debug(
      `Signing token when registering user ${JSON.stringify(user)}`,
    );
    return {
      access_token: await this.jwtService.signAsync(this.toJwtPayload(user)),
    };
  }

  async login(user: User): Promise<TokenResponse> {
    this.logger.debug(`Signing token when user login ${JSON.stringify(user)}`);
    return {
      access_token: await this.jwtService.signAsync(this.toJwtPayload(user)),
    };
  }

  toJwtPayload(user: User): JwtPayload {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
