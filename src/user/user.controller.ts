import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { Public } from '../auth/jwt-auth.decorator';
import { TokenResponse, UserRegisterRequest } from '../model/user.model';
import { WebResponse } from '../model/web.model';

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
}
