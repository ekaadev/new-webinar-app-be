import { z, ZodType } from 'zod';
import { UserLoginRequest, UserRegisterRequest } from '../model/user.model';

export class UserValidation {
  static readonly REGISTER: ZodType<UserRegisterRequest> = z.object({
    name: z.string().min(1).max(100),
    email: z.string().min(1).max(100).email(),
    password: z.string().min(1).max(100),
    role: z.string().min(1).max(50).optional(),
  });

  static readonly LOGIN: ZodType<UserLoginRequest> = z.object({
    email: z.string().min(1).max(100).email(),
    password: z.string().min(1).max(100),
  });
}
