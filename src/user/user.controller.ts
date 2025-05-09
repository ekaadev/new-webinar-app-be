import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Public } from '../auth/jwt-auth.decorator';
import {
  JwtPayload,
  TokenResponse,
  UserLoginRequest,
  UserRegisterRequest,
  UserResponse,
  UserUpdateRequest,
} from '../model/user.model';
import { WebResponse } from '../model/web.model';
import { Auth } from '../auth/auth.decorator';

@Controller('/api/v1/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() request: UserRegisterRequest,
  ): Promise<WebResponse<TokenResponse>> {
    const result = await this.userService.create(request);

    return {
      code: HttpStatus.CREATED,
      status: 'CREATED',
      data: result,
    };
  }

  @Public()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() request: UserLoginRequest,
  ): Promise<WebResponse<TokenResponse>> {
    const result = await this.userService.login(request);

    return {
      code: HttpStatus.OK,
      status: 'OK',
      data: result,
    };
  }

  @Get('/current')
  @HttpCode(HttpStatus.OK)
  async get(@Auth() user: JwtPayload): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.get(user);

    return {
      code: HttpStatus.OK,
      status: 'OK',
      data: result,
    };
  }

  @Patch('/current')
  @HttpCode(HttpStatus.OK)
  async update(
    @Auth() user: JwtPayload,
    @Body() request: UserUpdateRequest,
  ): Promise<WebResponse<UserResponse>> {
    request.id = user.id;
    const result = await this.userService.update(request);

    return {
      code: HttpStatus.OK,
      status: 'OK',
      data: result,
    };
  }

  @Delete('/logout')
  @HttpCode(HttpStatus.OK)
  logout(@Auth() user: JwtPayload): WebResponse<boolean> {
    const result = this.userService.logout(user);

    return {
      code: HttpStatus.OK,
      status: 'OK',
      data: result,
    };
  }
}
