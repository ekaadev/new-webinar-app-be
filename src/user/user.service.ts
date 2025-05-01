import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { AuthService } from '../auth/auth.service';
import {
  JwtPayload,
  TokenResponse,
  UserLoginRequest,
  UserRegisterRequest,
  UserResponse,
  UserUpdateRequest,
} from '../model/user.model';
import { UserValidation } from './user.validation';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly authService: AuthService,
  ) {}

  async create(request: UserRegisterRequest): Promise<TokenResponse> {
    this.logger.debug(`Creating new user ${JSON.stringify(request)}`);

    const userRegisterRequest =
      this.validationService.validate<UserRegisterRequest>(
        UserValidation.REGISTER,
        request,
      );

    const totalUserRegister = await this.prismaService.user.count({
      where: {
        email: userRegisterRequest.email,
      },
    });

    if (totalUserRegister > 0) {
      this.logger.error(
        `User with email ${userRegisterRequest.email} already exists`,
      );
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    const password = await bcrypt.hash(userRegisterRequest.password, 10);

    const user = await this.prismaService.user.create({
      data: {
        email: userRegisterRequest.email,
        password: password,
        name: userRegisterRequest.name,
      },
    });

    const token: TokenResponse = await this.authService.register(user);

    return {
      access_token: token.access_token,
    };
  }

  async login(request: UserLoginRequest): Promise<TokenResponse> {
    this.logger.debug(`Login user ${JSON.stringify(request)}`);

    const userLoginRequest: UserLoginRequest =
      this.validationService.validate<UserLoginRequest>(
        UserValidation.LOGIN,
        request,
      );

    const user = await this.prismaService.user.findFirst({
      where: {
        email: userLoginRequest.email,
      },
    });

    if (!user) {
      this.logger.error(
        `email or password is wrong ${JSON.stringify(userLoginRequest)}`,
      );
      throw new HttpException(
        'email or password is wrong',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const passwordValid = await bcrypt.compare(
      userLoginRequest.password,
      user.password,
    );

    if (!passwordValid) {
      this.logger.error(
        `email or password is wrong ${JSON.stringify(userLoginRequest)}`,
      );
      throw new HttpException(
        'email or password is wrong',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token: TokenResponse = await this.authService.login(user);

    return {
      access_token: token.access_token,
    };
  }

  async get(request: JwtPayload): Promise<UserResponse> {
    this.logger.debug(`Getting user ${JSON.stringify(request)}`);

    const user = await this.prismaService.user.findUnique({
      where: {
        id: request.id,
      },
    });

    if (!user) {
      this.logger.error(`User not found ${JSON.stringify(request)}`);
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return {
      email: user.email,
      name: user.name,
    };
  }

  async update(request: UserUpdateRequest): Promise<UserResponse> {
    this.logger.debug(`Update user ${JSON.stringify(request)}`);

    const userUpdateRequest: UserUpdateRequest =
      this.validationService.validate<UserUpdateRequest>(
        UserValidation.UPDATE,
        request,
      );

    const user = await this.prismaService.user.findUnique({
      where: {
        id: userUpdateRequest.id,
      },
    });

    if (!user) {
      this.logger.error(`User with id ${userUpdateRequest.id} not found`);
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (userUpdateRequest.name) {
      user.name = userUpdateRequest.name;
    }

    if (userUpdateRequest.password) {
      user.password = await bcrypt.hash(userUpdateRequest.password, 10);
    }

    const updateUser = await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        name: user.name,
        password: user.password,
      },
    });

    return {
      email: updateUser.email,
      name: updateUser.name,
    };
  }

  logout(user: any): boolean {
    this.logger.debug(`Logout user ${JSON.stringify(user)}`);

    return true;
  }
}
